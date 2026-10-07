// Capa de persistencia centralizada (Local-First: localStorage con sincronización en Supabase)
import { AppData, Category, Task, Note, Reminder } from '../types';
import { getTodayString } from './dates';
import { supabase, pushAllLocalDataToSupabase } from './supabase';

const GUEST_STORAGE_KEY = 'rekayu_app_data_v1';
const ACTIVE_USER_ID_KEY = 'rekayu_active_user_id';
const DELETED_IDS_KEY = 'rekayu_deleted_ids_v1';

let currentUserId: string | null = ((): string | null => {
  try {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  } catch {
    return null;
  }
})();

export const setActiveStorageUser = (userId: string | null): void => {
  currentUserId = userId;
  try {
    if (userId) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
    } else {
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
    }
  } catch {}
};

export const getActiveStorageUser = (): string | null => currentUserId;

export const getStorageKey = (): string => {
  if (currentUserId) {
    return `rekayu_user_${currentUserId}_v1`;
  }
  return GUEST_STORAGE_KEY;
};

// ==========================================
// REGISTRO DE ELEMENTOS ELIMINADOS (TOMBSTONES)
// ==========================================

export const getDeletedItemIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

export const markItemDeleted = (id: string): void => {
  try {
    const set = getDeletedItemIds();
    set.add(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
};

export const clearDeletedItem = (id: string): void => {
  try {
    const set = getDeletedItemIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch {}
};

export const isItemDeleted = (id: string): boolean => {
  return getDeletedItemIds().has(id);
};

// ==========================================
// CATEGORÍAS POR DEFECTO DEL SISTEMA
// ==========================================

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
  const key = getStorageKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Si el usuario está autenticado y no tiene datos locales, devolver estructura limpia
      if (currentUserId) {
        return {
          version: 1,
          categories: DEFAULT_CATEGORIES,
          tasks: [],
          notes: [],
          reminders: [],
        };
      }

      // Si es un visitante anónimo en modo local, darle bienvenida con semillas
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
    if (!parsed.categories || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
    }
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      parsed.tasks = [];
    }
    if (!parsed.notes || !Array.isArray(parsed.notes)) {
      parsed.notes = [];
    }
    if (!parsed.reminders || !Array.isArray(parsed.reminders)) {
      parsed.reminders = [];
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
  const key = getStorageKey();
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

/**
 * Migra los datos que el usuario haya creado en modo local (invitado) a su cuenta de Supabase
 */
export const migrateGuestDataToUser = (userId: string): AppData => {
  try {
    const guestRaw = localStorage.getItem(GUEST_STORAGE_KEY);
    const userKey = `rekayu_user_${userId}_v1`;
    const userRaw = localStorage.getItem(userKey);

    let userData: AppData = userRaw
      ? JSON.parse(userRaw)
      : {
          version: 1,
          categories: DEFAULT_CATEGORIES,
          tasks: [],
          notes: [],
          reminders: [],
        };

    // Asegurar que las listas siempre estén inicializadas como arrays
    userData.tasks = Array.isArray(userData.tasks) ? userData.tasks : [];
    userData.notes = Array.isArray(userData.notes) ? userData.notes : [];
    userData.reminders = Array.isArray(userData.reminders) ? userData.reminders : [];
    userData.categories = Array.isArray(userData.categories) ? userData.categories : DEFAULT_CATEGORIES;

    if (guestRaw) {
      const guestData: AppData = JSON.parse(guestRaw);
      const deletedIds = getDeletedItemIds();

      // Identificadores de semillas por defecto para no arrastrar semillas idénticas
      const seedTaskIds = new Set(['task-seed-1', 'task-seed-2', 'task-seed-3', 'task-seed-4', 'task-seed-5', 'task-seed-6', 'task-seed-7']);
      const seedNoteIds = new Set(['note-seed-1', 'note-seed-2']);
      const seedRemIds = new Set(['rem-seed-1', 'rem-seed-2']);

      // Filtrar tareas que realmente creó el usuario en local
      const existingTaskIds = new Set(userData.tasks.map((t) => t.id));
      const guestTasksToMigrate = (guestData.tasks || []).filter(
        (t) => !deletedIds.has(t.id) && !existingTaskIds.has(t.id) && (!seedTaskIds.has(t.id) || t.title.toLowerCase().includes('propuesta'))
      );

      // Notas creadas por el usuario
      const existingNoteIds = new Set(userData.notes.map((n) => n.id));
      const guestNotesToMigrate = (guestData.notes || []).filter(
        (n) => !deletedIds.has(n.id) && !existingNoteIds.has(n.id) && !seedNoteIds.has(n.id)
      );

      // Recordatorios creados por el usuario
      const existingRemIds = new Set(userData.reminders.map((r) => r.id));
      const guestRemindersToMigrate = (guestData.reminders || []).filter(
        (r) => !deletedIds.has(r.id) && !existingRemIds.has(r.id) && !seedRemIds.has(r.id)
      );

      // Categorías personalizadas creadas por el usuario
      const defaultCatIds = new Set(DEFAULT_CATEGORIES.map((c) => c.id));
      const existingCatIds = new Set(userData.categories.map((c) => c.id));
      const guestCatsToMigrate = (guestData.categories || []).filter(
        (c) => !deletedIds.has(c.id) && !existingCatIds.has(c.id) && !defaultCatIds.has(c.id)
      );

      if (
        guestTasksToMigrate.length > 0 ||
        guestNotesToMigrate.length > 0 ||
        guestRemindersToMigrate.length > 0 ||
        guestCatsToMigrate.length > 0
      ) {
        userData.tasks = [...guestTasksToMigrate, ...userData.tasks];
        userData.notes = [...guestNotesToMigrate, ...userData.notes];
        userData.reminders = [...guestRemindersToMigrate, ...userData.reminders];
        userData.categories = [...userData.categories, ...guestCatsToMigrate];

        localStorage.setItem(userKey, JSON.stringify(userData));
        // Subir inmediatamente a Supabase
        pushAllLocalDataToSupabase(userData, userId, deletedIds).catch(() => {});
        // Limpiar datos de invitado para que no se dupliquen ni resuciten nunca más
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }
    }

    return userData;
  } catch (err) {
    console.error('Error al migrar datos de invitado a usuario:', err);
    return getAppData();
  }
};

// ==========================================
// SINCRONIZACIÓN EN SEGUNDO PLANO CON SUPABASE
// ==========================================

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const scheduleBackgroundSync = (delayMs: number = 0) => {
  const client = supabase;
  if (!client) return;
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);

  const performSync = async () => {
    try {
      const {
        data: { session },
      } = await client.auth.getSession();
      const user = session?.user;
      if (!user) return; // Modo local: cero peticiones de red

      const current = getAppData();
      await pushAllLocalDataToSupabase(current, user.id, getDeletedItemIds());
    } catch {
      // Ignorar fallos de red silenciosamente (Local-First resiliente)
    }
  };

  if (delayMs === 0) {
    performSync();
  } else {
    syncDebounceTimer = setTimeout(performSync, delayMs);
  }
};

// Escuchar cambios de visibilidad o cierre de pestaña para vaciar cualquier sincronización pendiente
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    scheduleBackgroundSync(0);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      scheduleBackgroundSync(0);
    }
  });
}

export const deleteRemoteTask = async (id: string) => {
  markItemDeleted(id);
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
  markItemDeleted(id);
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
  markItemDeleted(id);
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
  markItemDeleted(id);
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
  tasks.forEach((t) => clearDeletedItem(t.id));
  scheduleBackgroundSync(0);
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
  newTasks.forEach((t) => clearDeletedItem(t.id));
  scheduleBackgroundSync(0);
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
  categories.forEach((c) => clearDeletedItem(c.id));
  scheduleBackgroundSync(0);
};

export const deleteCategoryFromStorage = (categoryId: string): void => {
  const current = getAppData();
  current.categories = (current.categories || []).filter((c) => c.id !== categoryId);
  
  // Reasignar tareas que apuntaban a esta categoría a la primera disponible
  const fallbackCatId = current.categories[0]?.id || 'cat-personal';
  if (current.tasks) {
    current.tasks = current.tasks.map((t) =>
      t.categoryId === categoryId ? { ...t, categoryId: fallbackCatId } : t
    );
  }

  saveAppData(current);
  markItemDeleted(categoryId);
  deleteRemoteCategory(categoryId).catch(() => {});
  scheduleBackgroundSync(0);
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
  notes.forEach((n) => clearDeletedItem(n.id));
  scheduleBackgroundSync(0);
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
  reminders.forEach((r) => clearDeletedItem(r.id));
  scheduleBackgroundSync(0);
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
