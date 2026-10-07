// Herramientas de depuración en consola para Rekayu
import { supabase } from './supabase';
import { getAppData, saveAppData, getActiveStorageUser } from './storage';
import { Reminder, Task, Note } from '../types';

export function setupRekayuDebug(onRefresh?: () => void) {
  if (typeof window === 'undefined') return;

  const debug = {
    /**
     * Muestra el estado actual de la sesión, Supabase y la memoria local
     */
    async status() {
      console.group('🔍 [Rekayu Debug] Estado del Sistema');
      const {
        data: { session },
      } = (await supabase?.auth.getSession()) || { data: { session: null } };

      const user = session?.user;
      console.log(
        '👤 Sesión activa:',
        user
          ? {
              email: user.email,
              id: user.id,
              confirmado: user.email_confirmed_at ? 'Sí' : 'No',
              creado: user.created_at,
            }
          : '❌ Ninguna (Modo Local - sin conexión a la base de datos)'
      );

      console.log('💾 ID activo en Storage:', getActiveStorageUser());
      const localData = getAppData();
      console.log('📦 Datos en caché local:', {
        tareas: localData.tasks?.length || 0,
        recordatorios: localData.reminders?.length || 0,
        notas: localData.notes?.length || 0,
        categorías: localData.categories?.length || 0,
      });
      console.groupEnd();
      return user || null;
    },

    /**
     * Consulta directamente las tablas de Supabase para este usuario
     */
    async fetchLive() {
      console.group('🌐 [Rekayu Debug] Consulta directa a Supabase');
      if (!supabase) {
        console.error('❌ Supabase no está configurado en las variables de entorno.');
        console.groupEnd();
        return null;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        console.warn('⚠️ No hay sesión activa en este navegador. Las consultas devolverán 0 filas por RLS.');
        console.groupEnd();
        return null;
      }

      const [taskRes, remRes, noteRes, catRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId),
        supabase.from('reminders').select('*').eq('user_id', userId),
        supabase.from('notes').select('*').eq('user_id', userId),
        supabase.from('categories').select('*').eq('user_id', userId),
      ]);

      console.log(`📋 Tareas en Supabase (${taskRes.data?.length || 0}):`, taskRes.data);
      if (taskRes.error) console.error('Error tareas:', taskRes.error);

      console.log(`⏰ Recordatorios en Supabase (${remRes.data?.length || 0}):`, remRes.data);
      if (remRes.error) console.error('Error recordatorios:', remRes.error);

      console.log(`📝 Notas en Supabase (${noteRes.data?.length || 0}):`, noteRes.data);
      if (noteRes.error) console.error('Error notas:', noteRes.error);

      console.log(`🏷️ Categorías en Supabase (${catRes.data?.length || 0}):`, catRes.data);
      if (catRes.error) console.error('Error categorías:', catRes.error);

      console.groupEnd();
      return {
        tasks: taskRes.data || [],
        reminders: remRes.data || [],
        notes: noteRes.data || [],
        categories: catRes.data || [],
      };
    },

    /**
     * Descarga los datos reales de Supabase y fuerza la actualización de la pantalla
     */
    async forceReload() {
      console.log('🔄 [Rekayu Debug] Forzando recarga directa desde Supabase...');
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        console.warn('⚠️ No puedes recargar desde Supabase sin haber iniciado sesión.');
        return;
      }

      const live = await debug.fetchLive();
      if (!live) return;

      const appData = getAppData();
      appData.tasks = (live.tasks || []).map((row: any): Task => ({
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
      }));

      appData.reminders = (live.reminders || []).map((row: any): Reminder => ({
        id: row.id,
        title: row.title,
        dueDate: row.due_date || undefined,
        dueTime: row.time || undefined,
        notes: row.notes || undefined,
        isCompleted: Boolean(row.is_completed),
        createdAt: row.created_at,
      }));

      appData.notes = (live.notes || []).map((row: any): Note => ({
        id: row.id,
        title: row.title,
        content: row.content || '',
        isPinned: Boolean(row.is_pinned),
        color: row.color || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      saveAppData(appData);
      if (onRefresh) onRefresh();
      console.log('✅ [Rekayu Debug] ¡Pantalla actualizada con los datos reales de Supabase!');
    },

    /**
     * Limpia la caché local de este navegador para empezar 100% limpio
     */
    clearCache() {
      console.log('🧹 [Rekayu Debug] Vaciando localStorage y caché de Service Worker...');
      const keys = ['rekayu_app_data_v1', 'rekayu_deleted_ids_v1'];
      const activeUser = getActiveStorageUser();
      if (activeUser) {
        keys.push(`rekayu_user_${activeUser}_v1`);
      }
      keys.forEach((k) => localStorage.removeItem(k));
      if ('caches' in window) {
        caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
      }
      console.log('✅ Caché borrada al 100%. Recarga (F5) para conectar directo con Supabase.');
    },
  };

  (window as any).rekayuDebug = debug;
  console.log(
    '%c[Rekayu Debug] 🛠️ Herramientas de depuración activadas en %cwindow.rekayuDebug%c\nComandos rápidos en consola:\n• rekayuDebug.status()      -> Comprobar si estás logueado y qué hay en local\n• rekayuDebug.fetchLive()   -> Ver qué hay realmente guardado en Supabase\n• rekayuDebug.forceReload() -> Traer los datos de Supabase a la pantalla ya\n• rekayuDebug.clearCache()  -> Limpiar caché local si se quedó algo atascado',
    'color: #5F8F80; font-weight: bold;',
    'color: #B8707A; font-weight: bold; background: rgba(184, 112, 122, 0.15); padding: 2px 6px; border-radius: 4px;',
    'color: inherit;'
  );
}
