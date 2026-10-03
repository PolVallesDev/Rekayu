import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Task, Category, Reminder, Note, AppData } from '../types';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Normalizar la URL eliminando '/rest/v1' o barras finales accidentales
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'tu-clave-anon-aqui' &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co')
);

// Cliente de Supabase inicializado de forma segura
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Obtiene el usuario autenticado actual si existe sesión activa.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Inicia sesión con correo y contraseña.
 */
export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase no está configurado');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Registra un nuevo usuario con correo, contraseña y nombre opcional.
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  if (!supabase) throw new Error('Supabase no está configurado');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName?.trim() || '',
      },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Cierra la sesión activa.
 */
export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ==========================================
// CONVERSORES ENTRE MODELO LOCAL Y BASE DE DATOS
// ==========================================

export function taskToDb(task: Task, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description || '',
    due_date: task.dueDate || null,
    time: task.time || null,
    priority: task.priority,
    category_id: task.categoryId || null,
    status: task.status,
    subtasks: task.subtasks || [],
    links: task.links || [],
    is_pinned: Boolean(task.isPinned),
    created_at: task.createdAt,
  };
}

export function dbToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    dueDate: row.due_date || undefined,
    time: row.time || undefined,
    priority: row.priority,
    categoryId: row.category_id || 'cat-personal',
    status: row.status,
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    links: Array.isArray(row.links) ? row.links : [],
    isPinned: Boolean(row.is_pinned),
    createdAt: row.created_at,
  };
}

export function categoryToDb(cat: Category, userId: string) {
  return {
    id: cat.id,
    user_id: userId,
    name: cat.name,
    color: cat.color,
    is_default: Boolean(cat.isDefault),
  };
}

export function dbToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    isDefault: Boolean(row.is_default),
  };
}

export function reminderToDb(rem: Reminder, userId: string) {
  return {
    id: rem.id,
    user_id: userId,
    title: rem.title,
    due_date: rem.dueDate || null,
    time: rem.dueTime || null,
    notes: rem.notes || '',
    is_completed: Boolean(rem.isCompleted),
    is_pinned: false,
    created_at: rem.createdAt,
  };
}

export function dbToReminder(row: any): Reminder {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.due_date || undefined,
    dueTime: row.time || undefined,
    notes: row.notes || undefined,
    isCompleted: Boolean(row.is_completed),
    createdAt: row.created_at,
  };
}

export function noteToDb(note: Note, userId: string) {
  return {
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content || '',
    is_pinned: Boolean(note.isPinned),
    color: note.color || null,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  };
}

export function dbToNote(row: any): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    isPinned: Boolean(row.is_pinned),
    color: row.color || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==========================================
// OPERACIONES REMOTAS DE DATOS CON SUPABASE
// ==========================================

export async function fetchRemoteAppData(userId: string): Promise<AppData | null> {
  if (!supabase) return null;
  try {
    const [catRes, taskRes, remRes, noteRes] = await Promise.all([
      supabase.from('categories').select('*').eq('user_id', userId),
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('reminders').select('*').eq('user_id', userId),
      supabase.from('notes').select('*').eq('user_id', userId),
    ]);

    if (catRes.error || taskRes.error || remRes.error || noteRes.error) {
      console.warn('Error al cargar datos de Supabase:', {
        cat: catRes.error?.message,
        task: taskRes.error?.message,
        rem: remRes.error?.message,
        note: noteRes.error?.message,
      });
      return null;
    }

    return {
      version: 1,
      categories: (catRes.data || []).map(dbToCategory),
      tasks: (taskRes.data || []).map(dbToTask),
      reminders: (remRes.data || []).map(dbToReminder),
      notes: (noteRes.data || []).map(dbToNote),
    };
  } catch (err) {
    console.error('Error en fetchRemoteAppData:', err);
    return null;
  }
}

export async function pushAllLocalDataToSupabase(data: AppData, userId: string): Promise<void> {
  if (!supabase) return;
  try {
    // 1. Categorías primero (por claves foráneas)
    if (data.categories.length > 0) {
      const dbCats = data.categories.map((c) => categoryToDb(c, userId));
      await supabase.from('categories').upsert(dbCats);
    }
    // 2. Tareas
    if (data.tasks.length > 0) {
      const dbTasks = data.tasks.map((t) => taskToDb(t, userId));
      await supabase.from('tasks').upsert(dbTasks);
    }
    // 3. Recordatorios
    if (data.reminders && data.reminders.length > 0) {
      const dbRems = data.reminders.map((r) => reminderToDb(r, userId));
      await supabase.from('reminders').upsert(dbRems);
    }
    // 4. Notas
    if (data.notes && data.notes.length > 0) {
      const dbNotes = data.notes.map((n) => noteToDb(n, userId));
      await supabase.from('notes').upsert(dbNotes);
    }
  } catch (err) {
    console.error('Error al subir datos locales a Supabase:', err);
  }
}
