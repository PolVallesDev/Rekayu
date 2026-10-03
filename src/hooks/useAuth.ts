import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  fetchRemoteAppData,
  pushAllLocalDataToSupabase,
} from '../lib/supabase';
import { getAppData, saveAppData } from '../lib/storage';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
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

  // Sincronizar datos entre local y la nube de Supabase con protección anti-bucle
  const syncWithCloud = useCallback(
    async (force: boolean = false): Promise<{ success: boolean; message: string }> => {
      if (!supabase) {
        return { success: false, message: 'Supabase no está configurado.' };
      }

      // Si ya hay una sincronización activa, no solapar
      if (isSyncingRef.current) {
        return { success: false, message: 'Sincronización en curso.' };
      }

      // Cooldown de 10 segundos para peticiones automáticas
      const now = Date.now();
      if (!force && now - lastSyncTimeRef.current < 10000) {
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

        const remoteNotesLen = remote.notes?.length || 0;
        const remoteRemindersLen = remote.reminders?.length || 0;
        const localNotesLen = local.notes?.length || 0;
        const localRemindersLen = local.reminders?.length || 0;

        const remoteTotal =
          remote.tasks.length + remote.categories.length + remoteNotesLen + remoteRemindersLen;
        const localTotal =
          local.tasks.length + local.categories.length + localNotesLen + localRemindersLen;

        // Si la nube está vacía pero tenemos datos locales, subimos los datos locales
        if (remoteTotal === 0 && localTotal > 0) {
          await pushAllLocalDataToSupabase(local, currentUser.id);
          lastSyncTimeRef.current = Date.now();
          return {
            success: true,
            message: `Se han subido ${local.tasks.length} tareas y ${localNotesLen} notas a tu cuenta en la nube.`,
          };
        }

        // Si la nube tiene datos, actualizamos el almacenamiento local
        if (remoteTotal > 0) {
          saveAppData(remote);
          lastSyncTimeRef.current = Date.now();
          if (onDataSyncedRef.current) {
            onDataSyncedRef.current();
          }
          return {
            success: true,
            message: `Sincronizadas ${remote.tasks.length} tareas y ${remoteNotesLen} notas desde la nube.`,
          };
        }

        lastSyncTimeRef.current = Date.now();
        return { success: true, message: 'Todo está sincronizado con la nube.' };
      } catch (err: any) {
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

  return {
    user,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    syncWithCloud,
  };
}
