// Capa de persistencia centralizada (Local-First: localStorage con sincronización en Supabase)
import { AppData, Category, Task, Note, Reminder } from '../types';
import { getTodayString } from './dates';
import { supabase, pushAllLocalDataToSupabase } from './supabase';

const STORAGE_KEY = 'rekayu_app_data_v1';

// Categorías por defecto del sistema
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-clase', name: 'Clase', color: '#7E9CB8', isDefault: true },
  { id: 'cat-examenes', name: 'Exámenes', color: '#B8707A', isDefault: true },
  { id: 'cat-emprendimiento', name: 'Emprender', color: '#C2A266', isDefault: true },
  { id: 'cat-personal', name: 'Personal', color: '#8FAE8B', isDefault: true },
];

// Semilla de tareas iniciales
const getSeedTasks = (): Task[] => {
  const today = getTodayString();
  const d = new Date();

  const examDate = new Date(d);
  examDate.setDate(d.getDate() + 5);
  const examDateStr = examDate.toISOString().split('T')[0];

  const practiceDate = new Date(d);
  practiceDate.setDate(d.getDate() + 3);
  const practiceDateStr = practiceDate.toISOString().split('T')[0];

  const tomorrow = new Date(d);
  tomorrow.setDate(d.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return [
    {
      id: 'task-seed-1',
      title: 'Entregar ejercicios de Álgebra',
      description: 'Ejercicios 3 a 7 del boletín. Subirlos en PDF al campus virtual antes de las 18:00.',
      dueDate: today,
      time: '18:00',
      priority: 'alta',
      categoryId: 'cat-clase',
      status: 'pendiente',
      subtasks: [
        { id: 'sub-1', text: 'Resolver el ejercicio 5', done: true },
        { id: 'sub-2', text: 'Pasar a limpio', done: false },
        { id: 'sub-3', text: 'Subir el PDF', done: false },
      ],
      links: [
        { id: 'link-1', url: 'https://campus.universidad.es/algebra' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-2',
      title: 'Repasar el tema 4 de Cálculo II',
      description: 'Derivadas parciales y regla de la cadena. Hacer los problemas del examen del año pasado.',
      dueDate: today,
      priority: 'alta',
      categoryId: 'cat-examenes',
      status: 'pendiente',
      subtasks: [
        { id: 'sub-4', text: 'Releer apuntes', done: false },
        { id: 'sub-5', text: 'Problemas de años anteriores', done: false },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-3',
      title: 'Escribir la propuesta para el primer cliente',
      description: 'Qué problema resolvemos, precio y plazos. Máximo una página.',
      dueDate: today,
      priority: 'media',
      categoryId: 'cat-emprendimiento',
      status: 'pendiente',
      links: [
        { id: 'link-2', url: 'https://docs.google.com/document' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-4',
      title: 'Examen de Cálculo II',
      description: 'Aula 2.3 a primera hora. Llevar calculadora permitida y DNI.',
      dueDate: examDateStr,
      priority: 'alta',
      categoryId: 'cat-examenes',
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-5',
      title: 'Práctica de Programación',
      description: 'Entrega en el repositorio de GitHub de la facultad.',
      dueDate: practiceDateStr,
      priority: 'alta',
      categoryId: 'cat-clase',
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-6',
      title: 'Reunión con el equipo del proyecto',
      description: 'Sincronización semanal sobre el desarrollo del prototipo.',
      dueDate: tomorrowStr,
      time: '11:30',
      priority: 'media',
      categoryId: 'cat-emprendimiento',
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-7',
      title: 'Comprar el billete de tren a casa',
      dueDate: today,
      priority: 'baja',
      categoryId: 'cat-personal',
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    },
  ];
};

// Semilla de notas iniciales
const getSeedNotes = (): Note[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'note-seed-1',
      title: 'Hipótesis del MVP de Rekayu',
      content:
        '1. Los estudiantes emprendedores necesitan ver plazos críticos sin sobrecarga visual.\n2. La separación clara entre tareas con fecha y anotaciones rápidas libera foco mental.\n3. Una interfaz minimalista y rápida aumenta la productividad diaria.',
      createdAt: now,
      updatedAt: now,
      isPinned: true,
    },
    {
      id: 'note-seed-2',
      title: 'Fórmulas clave - Finanzas',
      content:
        '• Punto de equilibrio = Costes fijos / (Precio - Coste variable)\n• Margen de contribución = (Ventas - Costes variables) / Ventas\n• CAC = Gasto marketing / Nuevos clientes',
      createdAt: now,
      updatedAt: now,
      isPinned: false,
    },
  ];
};

// Semilla de recordatorios iniciales
const getSeedReminders = (): Reminder[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'rem-seed-1',
      title: 'Revisar la agenda de la semana cada domingo por la tarde',
      isCompleted: false,
      createdAt: now,
    },
    {
      id: 'rem-seed-2',
      title: 'Enviar correo de seguimiento al mentor de la incubadora',
      isCompleted: true,
      createdAt: now,
    },
  ];
};

/**
 * Carga todo el estado de la aplicación desde la persistencia
 */
export const getAppData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialData: AppData = {
        version: 1,
        categories: DEFAULT_CATEGORIES,
        tasks: getSeedTasks(),
        notes: getSeedNotes(),
        reminders: getSeedReminders(),
      };
      saveAppData(initialData);
      return initialData;
    }

    const parsed: AppData = JSON.parse(raw);

    // Validar integridad mínima y asegurar colecciones
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      parsed.categories = DEFAULT_CATEGORIES;
    }
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      parsed.tasks = [];
    }
    if (!parsed.notes || !Array.isArray(parsed.notes)) {
      parsed.notes = getSeedNotes();
    }
    if (!parsed.reminders || !Array.isArray(parsed.reminders)) {
      parsed.reminders = getSeedReminders();
    }

    return parsed;
  } catch (error) {
    console.error('Error al leer de localStorage:', error);
    return {
      version: 1,
      categories: DEFAULT_CATEGORIES,
      tasks: [],
      notes: [],
      reminders: [],
    };
  }
};

/**
 * Guarda todo el estado de la aplicación en la persistencia
 */
export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

// ==========================================
// SINCRONIZACIÓN EN SEGUNDO PLANO CON SUPABASE
// ==========================================

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const scheduleBackgroundSync = () => {
  const client = supabase;
  if (!client) return;
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);

  syncDebounceTimer = setTimeout(async () => {
    try {
      // Usar getSession para no provocar errores de red si no hay sesión
      const {
        data: { session },
      } = await client.auth.getSession();
      const user = session?.user;
      if (!user) return; // Modo local: cero peticiones de red

      const current = getAppData();
      await pushAllLocalDataToSupabase(current, user.id);
    } catch {
      // Ignorar fallos de red silenciosamente (Local-First resiliente)
    }
  }, 1200);
};

export const deleteRemoteTask = async (id: string) => {
  const client = supabase;
  if (!client) return;
  try {
    const {
      data: { session },
    } = await client.auth.getSession();
    const user = session?.user;
    if (user) {
      await client.from('tasks').delete().eq('id', id).eq('user_id', user.id);
    }
  } catch {}
};

export const deleteRemoteCategory = async (id: string) => {
  const client = supabase;
  if (!client) return;
  try {
    const {
      data: { session },
    } = await client.auth.getSession();
    const user = session?.user;
    if (user) {
      await client.from('categories').delete().eq('id', id).eq('user_id', user.id);
    }
  } catch {}
};

export const deleteRemoteReminder = async (id: string) => {
  const client = supabase;
  if (!client) return;
  try {
    const {
      data: { session },
    } = await client.auth.getSession();
    const user = session?.user;
    if (user) {
      await client.from('reminders').delete().eq('id', id).eq('user_id', user.id);
    }
  } catch {}
};

export const deleteRemoteNote = async (id: string) => {
  const client = supabase;
  if (!client) return;
  try {
    const {
      data: { session },
    } = await client.auth.getSession();
    const user = session?.user;
    if (user) {
      await client.from('notes').delete().eq('id', id).eq('user_id', user.id);
    }
  } catch {}
};

/**
 * Tareas
 */
export const getTasks = (): Task[] => {
  return getAppData().tasks;
};

export const saveTasks = (tasks: Task[]): void => {
  const current = getAppData();
  current.tasks = tasks;
  saveAppData(current);
  scheduleBackgroundSync();
};

/**
 * Añade una lista de tareas importadas por lotes a la persistencia
 */
export const batchAddTasks = (newTasks: Task[]): void => {
  const current = getAppData();
  const existingIds = new Set(current.tasks.map((t) => t.id));
  const uniqueNew = newTasks.filter((t) => !existingIds.has(t.id));
  current.tasks = [...uniqueNew, ...current.tasks];
  saveAppData(current);
  scheduleBackgroundSync();
};

/**
 * Categorías
 */
export const getCategories = (): Category[] => {
  return getAppData().categories;
};

export const saveCategories = (categories: Category[]): void => {
  const current = getAppData();
  current.categories = categories;
  saveAppData(current);
  scheduleBackgroundSync();
};

/**
 * Notas / Anotaciones
 */
export const getNotes = (): Note[] => {
  return getAppData().notes || [];
};

export const saveNotes = (notes: Note[]): void => {
  const current = getAppData();
  current.notes = notes;
  saveAppData(current);
  scheduleBackgroundSync();
};

/**
 * Recordatorios
 */
export const getReminders = (): Reminder[] => {
  return getAppData().reminders || [];
};

export const saveReminders = (reminders: Reminder[]): void => {
  const current = getAppData();
  current.reminders = reminders;
  saveAppData(current);
  scheduleBackgroundSync();
};

/**
 * Añade un recordatorio automático para volver a importar el calendario en X días
 */
export const addImportReminder = (daysAhead: number, title?: string): Reminder => {
  const current = getAppData();
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const targetDateStr = d.toISOString().split('T')[0];

  const reminder: Reminder = {
    id: `rem-import-${Date.now()}`,
    title: title || `Actualizar calendario Moodle / .ics (${daysAhead} días)`,
    dueDate: targetDateStr,
    dueTime: '10:00',
    notes: `Recordatorio automático para volver a exportar e importar las tareas y entregas de Moodle.`,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  current.reminders = [reminder, ...(current.reminders || [])];
  saveAppData(current);
  return reminder;
};

/**
 * Exporta todos los datos en un archivo JSON descargable
 */
export const exportAppDataAsJSON = (): void => {
  const data = getAppData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `rekayu_backup_${getTodayString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Importa los datos desde un archivo JSON y los valida
 */
export const importAppDataFromJSON = async (
  file: File
): Promise<{ success: boolean; message: string; data?: AppData }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || typeof parsed !== 'object') {
          return resolve({
            success: false,
            message: 'El archivo JSON no tiene un formato válido.',
          });
        }

        if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.categories)) {
          return resolve({
            success: false,
            message: 'El archivo no contiene la estructura requerida (tasks y categories).',
          });
        }

        const validData: AppData = {
          version: parsed.version || 1,
          tasks: parsed.tasks,
          categories: parsed.categories,
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
        };

        saveAppData(validData);
        resolve({
          success: true,
          message: `Se importaron ${validData.tasks.length} tareas, ${validData.categories.length} categorías, ${validData.notes?.length || 0} notas y ${validData.reminders?.length || 0} recordatorios.`,
          data: validData,
        });
      } catch (err) {
        resolve({
          success: false,
          message: 'Error al procesar el archivo JSON. Verifica que el archivo no esté corrupto.',
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: 'No se pudo leer el archivo seleccionado.' });
    };

    reader.readAsText(file);
  });
};

// Configuración de apoyo e incidencias
import { SupportConfig, DEFAULT_SUPPORT_CONFIG } from './supportConfig';
export type { SupportConfig };

const SUPPORT_CONFIG_KEY = 'rekayu_support_config';

export const getSupportConfig = (): SupportConfig => {
  try {
    const raw = localStorage.getItem(SUPPORT_CONFIG_KEY);
    if (!raw) return DEFAULT_SUPPORT_CONFIG;
    return { ...DEFAULT_SUPPORT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SUPPORT_CONFIG;
  }
};

export const saveSupportConfig = (config: Partial<SupportConfig>): SupportConfig => {
  try {
    const current = getSupportConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(SUPPORT_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SUPPORT_CONFIG;
  }
};
