import { Task, Category } from '../types';

/**
 * Escapa caracteres especiales según la especificación RFC 5545:
 * Backslash, punto y coma, coma y saltos de línea.
 */
function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Pliega líneas largas (line folding) según la norma RFC 5545 (máx 75 octetos por línea).
 */
function foldLine(line: string): string {
  if (line.length <= 72) return line;
  let result = '';
  let remaining = line;
  while (remaining.length > 72) {
    result += remaining.substring(0, 72) + '\r\n ';
    remaining = remaining.substring(72);
  }
  result += remaining;
  return result;
}

/**
 * Calcula el día siguiente en formato YYYYMMDD para la fecha de fin exclusiva
 * de eventos de día completo en RFC 5545 (DTEND;VALUE=DATE:).
 */
function getNextDayDigits(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  const nextD = String(date.getDate()).padStart(2, '0');
  return `${nextY}${nextM}${nextD}`;
}

/**
 * Genera el contenido de un archivo .ics estándar RFC 5545 con las tareas fechadas.
 */
export function generateIcsContent(tasks: Task[], categories: Category[]): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Solo exportamos tareas que tengan fecha límite asignada
  const datedTasks = tasks.filter((t) => !!t.dueDate);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rekayu//Organizador Personal Calma//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Rekayu · Calendario',
    'X-WR-TIMEZONE:Europe/Madrid',
  ];

  datedTasks.forEach((task) => {
    const rawDate = task.dueDate!; // YYYY-MM-DD
    const dateDigits = rawDate.replace(/-/g, '');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:task-${task.id}@rekayu.app`);
    lines.push(`DTSTAMP:${nowUtc}`);

    // Fecha de inicio y fin (con hora o de día completo)
    if (task.time && /^\d{2}:\d{2}$/.test(task.time)) {
      const [hours, minutes] = task.time.split(':');
      const startDigits = `${dateDigits}T${hours}${minutes}00`;
      // Por defecto duración de 1 hora
      const endH = String((Number(hours) + 1) % 24).padStart(2, '0');
      const endDigits = `${dateDigits}T${endH}${minutes}00`;
      lines.push(`DTSTART:${startDigits}`);
      lines.push(`DTEND:${endDigits}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dateDigits}`);
      lines.push(`DTEND;VALUE=DATE:${getNextDayDigits(rawDate)}`);
    }

    // Título / Resumen
    lines.push(foldLine(`SUMMARY:${escapeIcsText(task.title)}`));

    // Descripción con notas, subtareas y enlaces
    const descParts: string[] = [];
    if (task.description?.trim()) {
      descParts.push(task.description.trim());
    }
    if (task.subtasks && task.subtasks.length > 0) {
      if (descParts.length > 0) descParts.push('');
      descParts.push('Subtareas:');
      task.subtasks.forEach((st) => {
        descParts.push(`${st.done ? '[✓]' : '[ ]'} ${st.text}`);
      });
    }
    if (task.links && task.links.length > 0) {
      if (descParts.length > 0) descParts.push('');
      descParts.push('Enlaces:');
      task.links.forEach((l) => {
        descParts.push(l.url);
      });
    }

    if (descParts.length > 0) {
      lines.push(foldLine(`DESCRIPTION:${escapeIcsText(descParts.join('\n'))}`));
    }

    // Categoría
    const catName = categoryMap.get(task.categoryId);
    if (catName) {
      lines.push(foldLine(`CATEGORIES:${escapeIcsText(catName)}`));
    }

    // Prioridad RFC 5545 (1: Alta, 5: Media, 9: Baja)
    const priorityCode = task.priority === 'alta' ? 1 : task.priority === 'media' ? 5 : 9;
    lines.push(`PRIORITY:${priorityCode}`);

    // Estado (COMPLETED / CONFIRMED)
    if (task.status === 'hecha') {
      lines.push('STATUS:COMPLETED');
    } else {
      lines.push('STATUS:CONFIRMED');
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Descarga directamente un archivo .ics con las tareas de Rekayu en el navegador.
 */
export function exportTasksToIcs(
  tasks: Task[],
  categories: Category[]
): { exportedCount: number; filename: string } {
  const datedTasks = tasks.filter((t) => !!t.dueDate);
  if (datedTasks.length === 0) {
    return { exportedCount: 0, filename: '' };
  }

  const icsContent = generateIcsContent(datedTasks, categories);
  const today = new Date().toISOString().split('T')[0];
  const filename = `rekayu-calendario-${today}.ics`;

  const blob = new Blob(['\ufeff' + icsContent], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    exportedCount: datedTasks.length,
    filename,
  };
}
