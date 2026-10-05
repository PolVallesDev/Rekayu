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
  saveAppData,
  DEFAULT_CATEGORIES,
  setActiveStorageUser,
} from '../lib/storage';

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

  // Sincronizar datos desde Supabase (BDD-First: la base de datos es la fuente de verdad)
  const syncWithCloud = useCallback(
    async (force: boolean = false): Promise<{ success: boolean; message: string }> => {
      if (!supabase) {
        return { success: false, message: 'Supabase no está configurado.' };
      }

      // Si ya hay una sincronización activa, no solapar
      if (isSyncingRef.current) {
        return { success: false, message: 'Sincronización en curso.' };
      }

      // Cooldown de 3 segundos para peticiones automáticas
      const now = Date.now();
      if (!force && now - lastSyncTimeRef.current < 3000) {
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
        // Enrutar storage al usuario autenticado
        setActiveStorageUser(currentUser.id);

        const remote = await fetchRemoteAppData(currentUser.id);
        if (!remote) {
          return { success: false, message: 'No se pudieron consultar los datos de Supabase.' };
        }

        // Si la cuenta es completamente nueva y no tiene categorías en Supabase, inicializar predeterminadas
        if (!remote.categories || remote.categories.length === 0) {
          remote.categories = DEFAULT_CATEGORIES;
          await pushAllLocalDataToSupabase(remote, currentUser.id);
        }

        // BDD-First: Supabase es la fuente de la verdad para la cuenta activa
        saveAppData(remote);

        lastSyncTimeRef.current = Date.now();
        if (onDataSyncedRef.current) {
          onDataSyncedRef.current();
        }

        return {
          success: true,
          message: `Sincronización completada: ${remote.tasks.length} tareas disponibles.`,
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

  // Escuchar cambios de sesión
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
      if (currentUser) {
        setActiveStorageUser(currentUser.id);
      } else {
        setActiveStorageUser(null);
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
      } else {
        setActiveStorageUser(null);
      }

      if (event === 'SIGNED_IN' && nextUser) {
        syncWithCloud(true).catch(() => {});
      } else if (event === 'SIGNED_OUT') {
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

  // Auto-sincronización silenciosa al enfocar o visibilizar la pestaña y periódicamente
  useEffect(() => {
    const client = supabase;
    if (!client || !user) return;

    const handleSyncTrigger = () => {
      if (document.visibilityState === 'visible') {
        syncWithCloud(false).catch(() => {});
      }
    };

    window.addEventListener('focus', handleSyncTrigger);
    document.addEventListener('visibilitychange', handleSyncTrigger);

    // Intervalo de comprobación periódica cada 30 segundos mientras la pestaña esté activa
    const intervalTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncWithCloud(false).catch(() => {});
      }
    }, 30000);

    // Suscripción a canal de cambios en tiempo real en Supabase de forma segura
    let channel: any = null;
    try {
      const channelId = `rekayu-realtime-${user.id}-${Math.random().toString(36).substring(2, 9)}`;
      channel = client
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          syncWithCloud(true).catch(() => {});
        });
      channel.subscribe();
    } catch {
      // Si falla la inicialización de realtime, no interrumpir la app
    }

    return () => {
      window.removeEventListener('focus', handleSyncTrigger);
      document.removeEventListener('visibilitychange', handleSyncTrigger);
      clearInterval(intervalTimer);
      if (channel) {
        try {
          client.removeChannel(channel);
        } catch {}
      }
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
    setActiveStorageUser(null);
    setUser(null);
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
    signIn,
    signUp,
    signOut,
    updateProfile,
    syncWithCloud,
  };
}
