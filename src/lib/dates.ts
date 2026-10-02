// Funciones de utilidad para el cálculo y formateo de fechas en lenguaje local

/**
 * Devuelve la fecha actual en formato local 'YYYY-MM-DD'
 */
export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calcula los días restantes hasta la fecha límite.
 * Negativo: fecha vencida.
 * 0: vence hoy.
 * Positivo: faltan X días.
 */
export const getDaysRemaining = (dueDateString: string): number => {
  if (!dueDateString) return 0;
  const [year, month, day] = dueDateString.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = target.getTime() - current.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Indica si una fecha ya ha pasado respecto a hoy
 */
export const isOverdue = (dueDateString?: string): boolean => {
  if (!dueDateString) return false;
  return getDaysRemaining(dueDateString) < 0;
};

/**
 * Indica si una fecha corresponde exactamente al día de hoy
 */
export const isToday = (dueDateString?: string): boolean => {
  if (!dueDateString) return false;
  return getDaysRemaining(dueDateString) === 0;
};

/**
 * Nivel de urgencia para exámenes o entregas:
 * - 'urgente': <= 2 días (Rojo)
 * - 'proximo': <= 7 días (Naranja)
 * - 'tranquilo': > 7 días (Verde)
 */
export type UrgencyLevel = 'urgente' | 'proximo' | 'tranquilo' | 'vencido';

export const getUrgencyLevel = (dueDateString: string): UrgencyLevel => {
  const days = getDaysRemaining(dueDateString);
  if (days < 0) return 'vencido';
  if (days <= 2) return 'urgente';
  if (days <= 7) return 'proximo';
  return 'tranquilo';
};

/**
 * Formatea una fecha para mostrarla de forma amigable (ej: "Hoy", "Mañana", "Jue, 15 oct")
 */
export const formatDateFriendly = (dueDateString: string): string => {
  if (!dueDateString) return '';
  const days = getDaysRemaining(dueDateString);

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days === -1) return 'Ayer';
  if (days < -1) return `Venció hace ${Math.abs(days)} días`;

  const [year, month, day] = dueDateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Devuelve la fecha actual en formato extendido en español (ej: "viernes, 2 de octubre")
 */
export const getTodayFormattedLong = (): string => {
  const now = new Date();
  return now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

/**
 * Devuelve una fecha en formato extendido en español (ej: "miércoles, 7 de octubre")
 */
export const formatDateLongSpanish = (dueDateString: string): string => {
  if (!dueDateString) return '';
  const [year, month, day] = dueDateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

