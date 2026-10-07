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
  DEFAULT_CATEGORIES,
  setActiveStorageUser,
  migrateGuestDataToUser,
  getDeletedItemIds,
} from '../lib/storage';
import { AppData, Category, Task, Note, Reminder } from '../types';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, fullName?: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<User | null>;
  syncWithCloud: (force?: boolean) => Promise<{ success: boolean; message: string }>;
}

export function useAuth(onDataSynced?: () => void): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Mantener referencia estable a onDataSynced para no disparar re-renderizados ni bucles
  const onDataSyncedRef = useRef(onDataSynced);
  useEffect(() => {
    onDataSyncedRef.current = onDataSynced;
  }, [onDataSynced]);

  // Candados para evitar sincronizaciones concurrentes y bucles infinitos
  const isSyncingRef = useRef(false);
  const lastSyncTimeRef = useRef(0);

  // Sincronizar datos entre local y Supabase de forma inteligente y bidireccional
  const syncWithCloud = useCallback(
    async (force: boolean = false): Promise<{ success: boolean; message: string }> => {
      if (!supabase) {
        setSyncStatus('local');
        return { success: false, message: 'Supabase no está configurado.' };
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncStatus('offline');
        return { success: false, message: 'Sin conexión a internet.' };
      }

      // Si ya hay una sincronización activa, no solapar
      if (isSyncingRef.current) {
        return { success: false, message: 'Sincronización en curso.' };
      }

      // Cooldown de 2.5 segundos para peticiones automáticas
      const now = Date.now();
      if (!force && now - lastSyncTimeRef.current < 2500) {
        return { success: true, message: 'Datos recientemente sincronizados.' };
      }

      // Leer sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) {
        setSyncStatus('local');
        return { success: false, message: 'Modo local (sin sesión activa).' };
      }

      isSyncingRef.current = true;
      setSyncStatus('syncing');

      try {
        // 1. Enrutar storage al usuario autenticado
        setActiveStorageUser(currentUser.id);

        // 2. Si venía de crear tareas en modo invitado, migrarlas a su cuenta
        migrateGuestDataToUser(currentUser.id);

        // 3. Consultar datos en la nube
        const remote = await fetchRemoteAppData(currentUser.id);
        if (!remote) {
          setSyncStatus('offline');
          return { success: false, message: 'No se pudieron consultar los datos de Supabase.' };
        }

        const local = getAppData();
        const deletedIds = getDeletedItemIds();

        // 4. FUSIÓN INTELIGENTE BIDIRECCIONAL (Sin pérdida de datos locales)
        let hasLocalChangesToPush = false;

        // A) Categorías
        const mergedCatsMap = new Map<string, Category>();
        (remote.categories || []).forEach((rc) => {
          if (!deletedIds.has(rc.id)) {
            mergedCatsMap.set(rc.id, rc);
          }
        });
        (local.categories || []).forEach((lc) => {
          if (deletedIds.has(lc.id)) return;
          if (!mergedCatsMap.has(lc.id)) {
            mergedCatsMap.set(lc.id, lc);
            hasLocalChangesToPush = true;
          }
        });
        DEFAULT_CATEGORIES.forEach((dc) => {
          if (!mergedCatsMap.has(dc.id) && !deletedIds.has(dc.id)) {
            mergedCatsMap.set(dc.id, dc);
            hasLocalChangesToPush = true;
          }
        });
        const mergedCategories = Array.from(mergedCatsMap.values());

        // B) Tareas
        const mergedTasksMap = new Map<string, Task>();
        (remote.tasks || []).forEach((rt) => {
          if (!deletedIds.has(rt.id)) {
            mergedTasksMap.set(rt.id, rt);
          }
        });
        (local.tasks || []).forEach((lt) => {
          if (deletedIds.has(lt.id)) return;
          if (!mergedTasksMap.has(lt.id)) {
            // Tarea local creada que aún no está en la nube: preservarla y subirla
            mergedTasksMap.set(lt.id, lt);
            hasLocalChangesToPush = true;
          }
        });
        const mergedTasks = Array.from(mergedTasksMap.values());

        // C) Recordatorios
        const mergedRemsMap = new Map<string, Reminder>();
        (remote.reminders || []).forEach((rr) => {
          if (!deletedIds.has(rr.id)) {
            mergedRemsMap.set(rr.id, rr);
          }
        });
        (local.reminders || []).forEach((lr) => {
          if (deletedIds.has(lr.id)) return;
          if (!mergedRemsMap.has(lr.id)) {
            mergedRemsMap.set(lr.id, lr);
            hasLocalChangesToPush = true;
          }
        });
        const mergedReminders = Array.from(mergedRemsMap.values());

        // D) Notas
        const mergedNotesMap = new Map<string, Note>();
        (remote.notes || []).forEach((rn) => {
          if (!deletedIds.has(rn.id)) {
            mergedNotesMap.set(rn.id, rn);
          }
        });
        (local.notes || []).forEach((ln) => {
          if (deletedIds.has(ln.id)) return;
          if (!mergedNotesMap.has(ln.id)) {
            mergedNotesMap.set(ln.id, ln);
            hasLocalChangesToPush = true;
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

        // 5. Guardar en local storage
        saveAppData(mergedData);

        // 6. Si hay cambios locales o la nube estaba vacía o hay borrados que purgar, actualizar Supabase
        if (
          hasLocalChangesToPush ||
          deletedIds.size > 0 ||
          (remote.categories || []).length === 0 ||
          (remote.tasks || []).length < mergedTasks.length
        ) {
          await pushAllLocalDataToSupabase(mergedData, currentUser.id, deletedIds);
        }

        lastSyncTimeRef.current = Date.now();
        setLastSyncedAt(new Date());
        setSyncStatus('synced');

        if (onDataSyncedRef.current) {
          onDataSyncedRef.current();
        }

        return {
          success: true,
          message: `Sincronización completada: ${mergedTasks.length} tareas disponibles.`,
        };
      } catch (err: any) {
        console.error('Error durante la sincronización:', err);
        setSyncStatus('offline');
        return { success: false, message: err?.message || 'Error durante la sincronización.' };
      } finally {
        isSyncingRef.current = false;
      }
    },
    []
  );

  // Escuchar cambios de sesión y cargar estado
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setSyncStatus('local');
      return;
    }

    let isMounted = true;

    // Comprobar sesión actual al iniciar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setActiveStorageUser(currentUser.id);
        setSyncStatus('synced');
      } else {
        setActiveStorageUser(null);
        setSyncStatus('local');
      }
      setLoading(false);
      if (currentUser) {
        syncWithCloud(true).catch(() => {});
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

      if (nextUser) {
        setActiveStorageUser(nextUser.id);
        migrateGuestDataToUser(nextUser.id);
      } else {
        setActiveStorageUser(null);
        setSyncStatus('local');
      }

      if (event === 'SIGNED_IN' && nextUser) {
        syncWithCloud(true).catch(() => {});
      } else if (event === 'SIGNED_OUT') {
        setSyncStatus('local');
        if (onDataSyncedRef.current) {
          onDataSyncedRef.current();
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncWithCloud]);

  // Auto-sincronización silenciosa en foco, visibilidad, online/offline y Realtime
  useEffect(() => {
    const client = supabase;
    if (!client || !user) return;

    const handleSyncTrigger = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncWithCloud(false).catch(() => {});
      }
    };

    const handleOnline = () => {
      syncWithCloud(true).catch(() => {});
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('focus', handleSyncTrigger);
    document.addEventListener('visibilitychange', handleSyncTrigger);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Intervalo de comprobación periódica cada 30 segundos mientras la pestaña esté activa
    const intervalTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncWithCloud(false).catch(() => {});
      }
    }, 30000);

    // Suscripción a canal Realtime en Supabase
    let channel: any = null;
    try {
      const channelId = `rekayu-realtime-${user.id}`;
      channel = client
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          syncWithCloud(true).catch(() => {});
        });
      channel.subscribe();
    } catch {
      // Ignorar fallos de websocket
    }

    return () => {
      window.removeEventListener('focus', handleSyncTrigger);
      document.removeEventListener('visibilitychange', handleSyncTrigger);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalTimer);
      if (channel) {
        try {
          client.removeChannel(channel);
        } catch {}
      }
    };
  }, [user, syncWithCloud]);

  const signIn = async (email: string, pass: string) => {
    const data = await signInWithEmail(email, pass);
    if (data?.user) {
      setUser(data.user);
      setActiveStorageUser(data.user.id);
      migrateGuestDataToUser(data.user.id);
      await syncWithCloud(true);
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    fullName?: string
  ): Promise<{ needsConfirmation: boolean }> => {
    const data = await signUpWithEmail(email, pass, fullName);
    const needsConfirmation = !data.session;
    if (data.session?.user) {
      setUser(data.session.user);
      setActiveStorageUser(data.session.user.id);
      migrateGuestDataToUser(data.session.user.id);
      await syncWithCloud(true);
    }
    return { needsConfirmation };
  };

  const signOut = async () => {
    await supabaseSignOut();
    setActiveStorageUser(null);
    setUser(null);
    setSyncStatus('local');
    if (onDataSyncedRef.current) {
      onDataSyncedRef.current();
    }
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
    syncStatus,
    lastSyncedAt,
    signIn,
    signUp,
    signOut,
    updateProfile,
    syncWithCloud,
  };
}
