import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  updateUserProfile,
  fetchRemoteAppData,
  pushAllLocalDataToSupabase,
} from '../lib/supabase';
import {
  getAppData,
  saveAppData,
  getDeletedItemIds,
  DEFAULT_CATEGORIES,
} from '../lib/storage';
import { AppData, Category, Task, Note, Reminder } from '../types';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<User | null>;
  syncWithCloud: (force?: boolean) => Promise<{ success: boolean; message: string }>;
}

export function useAuth(onDataSynced?: () => void): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mantener referencia estable a onDataSynced para no disparar re-renderizados ni bucles
  const onDataSyncedRef = useRef(onDataSynced);
  useEffect(() => {
    onDataSyncedRef.current = onDataSynced;
  }, [onDataSynced]);

  // Candados para evitar sincronizaciones concurrentes y bucles infinitos
  const isSyncingRef = useRef(false);
  const lastSyncTimeRef = useRef(0);

  // Sincronizar datos entre local y la nube de Supabase con fusión inteligente bidireccional
  const syncWithCloud = useCallback(
    async (force: boolean = false): Promise<{ success: boolean; message: string }> => {
      if (!supabase) {
        return { success: false, message: 'Supabase no está configurado.' };
      }

      // Si ya hay una sincronización activa, no solapar
      if (isSyncingRef.current) {
        return { success: false, message: 'Sincronización en curso.' };
      }

      // Cooldown de 5 segundos para peticiones automáticas
      const now = Date.now();
      if (!force && now - lastSyncTimeRef.current < 5000) {
        return { success: true, message: 'Datos recientemente sincronizados.' };
      }

      // Leer sesión de forma local sin hacer petición de red si no hay credenciales
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) {
        return { success: false, message: 'No hay sesión activa en la nube.' };
      }

      isSyncingRef.current = true;
      try {
        const remote = await fetchRemoteAppData(currentUser.id);
        const local = getAppData();

        if (!remote) {
          return { success: false, message: 'No se pudieron consultar los datos de Supabase.' };
        }

        const deletedIds = getDeletedItemIds();

        // 1. Fusión de categorías
        const mergedCategoriesMap = new Map<string, Category>();
        (remote.categories || []).forEach((c) => {
          if (!deletedIds.has(c.id)) {
            mergedCategoriesMap.set(c.id, c);
          }
        });
        (local.categories || []).forEach((c) => {
          if (!deletedIds.has(c.id) && !mergedCategoriesMap.has(c.id)) {
            mergedCategoriesMap.set(c.id, c);
          }
        });
        DEFAULT_CATEGORIES.forEach((defCat) => {
          if (!mergedCategoriesMap.has(defCat.id)) {
            mergedCategoriesMap.set(defCat.id, defCat);
          }
        });
        const mergedCategories = Array.from(mergedCategoriesMap.values());

        // 2. Fusión de tareas
        // Supabase tiene preferencia para tareas con el mismo ID,
        // pero NINGUNA tarea local se descarta.
        const mergedTasksMap = new Map<string, Task>();

        (remote.tasks || []).forEach((rt) => {
          if (!deletedIds.has(rt.id)) {
            mergedTasksMap.set(rt.id, rt);
          }
        });

        (local.tasks || []).forEach((lt) => {
          if (deletedIds.has(lt.id)) return;

          // Si es la propuesta MVP del usuario y choca con un seed que tiene otro título
          if (
            (lt.title.toLowerCase().includes('entrega de propuesta mvp') ||
              lt.title.toLowerCase().includes('propuesta mvp')) &&
            mergedTasksMap.has(lt.id) &&
            !mergedTasksMap.get(lt.id)!.title.toLowerCase().includes('propuesta mvp')
          ) {
            const mvpTask = { ...lt, id: 'task-propuesta-mvp' };
            mergedTasksMap.set(mvpTask.id, mvpTask);
            return;
          }

          if (!mergedTasksMap.has(lt.id)) {
            // Tarea local nueva que no está en remoto: se conserva íntegra
            mergedTasksMap.set(lt.id, lt);
          }
        });
        const mergedTasks = Array.from(mergedTasksMap.values());

        // 3. Fusión de recordatorios
        const mergedRemindersMap = new Map<string, Reminder>();
        (remote.reminders || []).forEach((rr) => {
          if (!deletedIds.has(rr.id)) {
            mergedRemindersMap.set(rr.id, rr);
          }
        });
        (local.reminders || []).forEach((lr) => {
          if (!deletedIds.has(lr.id) && !mergedRemindersMap.has(lr.id)) {
            mergedRemindersMap.set(lr.id, lr);
          }
        });
        const mergedReminders = Array.from(mergedRemindersMap.values());

        // 4. Fusión de notas
        const mergedNotesMap = new Map<string, Note>();
        (remote.notes || []).forEach((rn) => {
          if (!deletedIds.has(rn.id)) {
            mergedNotesMap.set(rn.id, rn);
          }
        });
        (local.notes || []).forEach((ln) => {
          if (!deletedIds.has(ln.id) && !mergedNotesMap.has(ln.id)) {
            mergedNotesMap.set(ln.id, ln);
          }
        });
        const mergedNotes = Array.from(mergedNotesMap.values());

        const mergedData: AppData = {
          version: 1,
          categories: mergedCategories,
          tasks: mergedTasks,
          reminders: mergedReminders,
          notes: mergedNotes,
        };

        // Guardar datos fusionados en localStorage
        saveAppData(mergedData);

        // Subir los datos combinados inmediatamente a Supabase (así Supabase recibe todas las tareas locales)
        await pushAllLocalDataToSupabase(mergedData, currentUser.id);

        lastSyncTimeRef.current = Date.now();
        if (onDataSyncedRef.current) {
          onDataSyncedRef.current();
        }

        return {
          success: true,
          message: `Sincronización completada: ${mergedTasks.length} tareas disponibles.`,
        };
      } catch (err: any) {
        console.error('Error durante la sincronización:', err);
        return { success: false, message: err?.message || 'Error durante la sincronización.' };
      } finally {
        isSyncingRef.current = false;
      }
    },
    []
  );

  // Escuchar cambios de sesión una sola vez al montar
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Comprobar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        syncWithCloud(false).catch(() => {});
      }
    });

    // Suscripción a eventos de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setLoading(false);

      if (event === 'SIGNED_IN' && nextUser) {
        syncWithCloud(true).catch(() => {});
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncWithCloud]);

  // Auto-sincronización silenciosa al enfocar la pestaña (con cooldown de 10s)
  useEffect(() => {
    if (!supabase) return;
    const handleFocus = () => {
      if (document.visibilityState === 'visible' && user) {
        syncWithCloud(false).catch(() => {});
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, syncWithCloud]);

  const signIn = async (email: string, pass: string) => {
    await signInWithEmail(email, pass);
  };

  const signUp = async (email: string, pass: string, fullName?: string) => {
    await signUpWithEmail(email, pass, fullName);
  };

  const signOut = async () => {
    await supabaseSignOut();
    setUser(null);
  };

  const updateProfile = async (fullName: string) => {
    const updated = await updateUserProfile(fullName);
    if (updated) {
      setUser(updated);
    }
    return updated;
  };

  return {
    user,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    updateProfile,
    syncWithCloud,
  };
}
