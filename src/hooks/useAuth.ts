import { useState, useEffect, useCallback } from 'react';
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
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncWithCloud: () => Promise<{ success: boolean; message: string }>;
}

export function useAuth(onDataSynced?: () => void): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sincronizar datos entre local y la nube de Supabase
  const syncWithCloud = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!supabase || !user) {
      return { success: false, message: 'No hay sesión activa en la nube.' };
    }

    try {
      const remote = await fetchRemoteAppData(user.id);
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
        await pushAllLocalDataToSupabase(local, user.id);
        return {
          success: true,
          message: `Se han subido ${local.tasks.length} tareas y ${localNotesLen} notas a tu cuenta en la nube.`,
        };
      }

      // Si la nube tiene datos, actualizamos el almacenamiento local
      if (remoteTotal > 0) {
        saveAppData(remote);
        if (onDataSynced) onDataSynced();
        return {
          success: true,
          message: `Sincronizadas ${remote.tasks.length} tareas y ${remoteNotesLen} notas desde la nube.`,
        };
      }

      return { success: true, message: 'Todo está sincronizado con la nube.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error durante la sincronización.' };
    }
  }, [user, onDataSynced]);

  // Escuchar cambios de sesión
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Comprobar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        syncWithCloud().catch(() => {});
      }
    });

    // Suscripción reactiva a cambios de sesión (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setLoading(false);
      if (nextUser) {
        syncWithCloud().catch(() => {});
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncWithCloud]);

  const signIn = async (email: string, pass: string) => {
    await signInWithEmail(email, pass);
  };

  const signUp = async (email: string, pass: string) => {
    await signUpWithEmail(email, pass);
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
