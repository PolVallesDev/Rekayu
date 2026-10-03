import { Priority } from '../types';

export interface ParsedIcsEvent {
  uid: string;
  rawTitle: string;
  cleanTitle: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  time?: string; // HH:mm
  links: { id: string; url: string }[];
  suggestedCategory: string; // 'cat-examenes' | 'cat-clase'
  suggestedPriority: Priority;
  isDuplicate?: boolean;
}

/**
 * Deshace el salto de línea (line folding) según RFC 5545:
 * Cualquier salto de línea CRLF o LF seguido inmediatamente por un espacio o tabulación se elimina.
 */
const unfoldIcsLines = (raw: string): string => {
  return raw.replace(/\r?\n[ \t]/g, '');
};

/**
 * Limpia caracteres de escape y entidades HTML frecuentes en plataformas LMS (Moodle, Canvas, etc.)
 */
const unescapeIcsText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

/**
 * Extrae URLs válidas de una descripción de texto
 */
const extractLinks = (text: string): { id: string; url: string }[] => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s\)\>\]"'`]+)/gi;
  const matches = text.match(urlRegex) || [];
  const uniqueUrls = Array.from(new Set(matches));
  return uniqueUrls.map((url, idx) => ({
    id: `link-ics-${idx}-${Date.now()}`,
    url: url.replace(/[.,;:]+$/, ''), // Limpiar puntuación final accidental
  }));
};

/**
 * Limpia prefijos y sufijos habituales de plataformas LMS en múltiples idiomas:
 * Catalán: "Venciment de ...", "es tanca el"
 * Castellano: "Vencimiento de ...", "Entrega de ...", "se cierra el", "Fecha límite:"
 * Inglés: "Due date for ...", "Due:", "Assignment:", "closes on"
 * Francés: "Échéance de ...", "se termine le"
 */
export const cleanLmsTitle = (raw: string): string => {
  if (!raw) return '';
  let cleaned = raw.trim();

  // Prefijos multilenguaje habituales
  const prefixRegex = /^(venciment\s+de\s+|vencimiento\s+de\s+|entrega\s+de\s+|due\s*:\s*|due\s+date\s+for\s+|assignment\s*:\s*|échéance\s+de\s+|devoir\s*:\s*|tarea\s*:\s*|tasca\s*:\s*)/i;
  cleaned = cleaned.replace(prefixRegex, '');

  // Sufijos multilenguaje habituales
  const suffixRegex = /(\s+es\s+tanca\s+el.*|\s+se\s+cierra\s+el.*|\s+closes\s+on.*|\s+se\s+termine\s+le.*)$/i;
  cleaned = cleaned.replace(suffixRegex, '');

  return cleaned.trim() || raw.trim();
};

/**
 * Detecta si el título sugiere un examen / prueba en múltiples idiomas:
 * Catalán: prova, examen, test, avaluació, parcial, final
 * Castellano: prueba, examen, test, evaluación, control, parcial, final
 * Inglés: exam, quiz, test, assessment, midterm, final
 * Francés: examen, épreuve, contrôle, évaluation
 */
export const detectExamCategory = (title: string): boolean => {
  const examKeywords = /(exam|prova|prueba|épreuve|quiz|test|parcial|midterm|final|control|avaluaci|evaluaci|assessment)/i;
  return examKeywords.test(title);
};

/**
 * Parsea un timestamp de iCal (ej. 20261001T150500Z, 20261001T150500 o 20261001)
 * y lo convierte a la fecha y hora local del usuario en formato YYYY-MM-DD y HH:mm.
 */
export const parseIcsDate = (dateStr: string): { dueDate: string; time?: string } => {
  if (!dateStr) {
    const today = new Date().toISOString().split('T')[0];
    return { dueDate: today };
  }

  const clean = dateStr.trim();

  // Caso: Todo el día YYYYMMDD
  if (/^\d{8}$/.test(clean)) {
    const year = clean.substring(0, 4);
    const month = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    return { dueDate: `${year}-${month}-${day}` };
  }

  // Caso: Fecha con hora YYYYMMDDTHHmmss(Z?)
  const match = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (match) {
    const [, y, m, d, hh, mm, ss, isUtc] = match;

    if (isUtc === 'Z') {
      // Hora UTC: convertir a hora local del navegador
      const utcDate = new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm, +ss));
      const localYear = utcDate.getFullYear();
      const localMonth = String(utcDate.getMonth() + 1).padStart(2, '0');
      const localDay = String(utcDate.getDate()).padStart(2, '0');
      const localHours = String(utcDate.getHours()).padStart(2, '0');
      const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');

      return {
        dueDate: `${localYear}-${localMonth}-${localDay}`,
        time: `${localHours}:${localMinutes}`,
      };
    } else {
      // Hora local ya especificada en el archivo
      return {
        dueDate: `${y}-${m}-${d}`,
        time: `${hh}:${mm}`,
      };
    }
  }

  // Fallback seguro a la fecha de hoy
  return { dueDate: new Date().toISOString().split('T')[0] };
};

/**
 * Parsea el texto completo de un archivo .ics (Moodle, Google Calendar, Canvas, etc.)
 */
export const parseIcsContent = (icsText: string): ParsedIcsEvent[] => {
  const unfolded = unfoldIcsLines(icsText);
  const rawEvents = unfolded.split('BEGIN:VEVENT').slice(1);

  const parsedEvents: ParsedIcsEvent[] = [];

  for (const rawEv of rawEvents) {
    const eventBlock = rawEv.split('END:VEVENT')[0] || '';

    // Extraer propiedades línea a línea dentro del VEVENT
    const getField = (name: string): string => {
      // Coincide con NOMBRE:... o NOMBRE;PARAMETROS:...
      const regex = new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, 'im');
      const match = eventBlock.match(regex);
      return match ? match[1].trim() : '';
    };

    const uid = getField('UID') || `uid-${Math.random().toString(36).substring(2, 9)}`;
    const summaryRaw = unescapeIcsText(getField('SUMMARY'));
    const descriptionRaw = unescapeIcsText(getField('DESCRIPTION'));
    const dtstart = getField('DTSTART');
    const dtend = getField('DTEND');

    // En Moodle, DTEND o DTSTART suele marcar la fecha de entrega
    const targetDateStr = dtend || dtstart;
    const { dueDate, time } = parseIcsDate(targetDateStr);

    const cleanTitle = cleanLmsTitle(summaryRaw);
    const isExam = detectExamCategory(cleanTitle || summaryRaw);

    // Prioridad y categoría sugeridas
    const suggestedCategory = isExam ? 'cat-examenes' : 'cat-clase';
    const suggestedPriority: Priority = isExam ? 'alta' : 'media';

    const links = extractLinks(descriptionRaw);

    parsedEvents.push({
      uid,
      rawTitle: summaryRaw,
      cleanTitle: cleanTitle || summaryRaw || 'Sin título',
      description: descriptionRaw,
      dueDate,
      time,
      links,
      suggestedCategory,
      suggestedPriority,
    });
  }

  // Ordenar por fecha cronológica ascendente
  parsedEvents.sort((a, b) => {
    const dateComp = a.dueDate.localeCompare(b.dueDate);
    if (dateComp !== 0) return dateComp;
    return (a.time || '00:00').localeCompare(b.time || '00:00');
  });

  return parsedEvents;
};
