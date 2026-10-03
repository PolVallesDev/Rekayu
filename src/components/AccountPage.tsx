import React, { useState } from 'react';
import {
  User as UserIcon,
  Cloud,
  CheckCircle,
  HardDrive,
  LogOut,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckSquare,
  FileText,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { getAppData } from '../lib/storage';

interface AccountPageProps {
  onGoHome?: () => void;
  onDataRestored?: () => void;
  onNavigateToSettings?: () => void;
  onOpenAuth?: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onGoHome,
  onDataRestored,
  onNavigateToSettings,
  onOpenAuth,
}) => {
  const { user, isConfigured, signOut } = useAuth(onDataRestored);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Obtener estadísticas de uso local
  const appData = getAppData();
  const totalTasks = appData.tasks?.length || 0;
  const completedTasks = appData.tasks?.filter((t) => t.status === 'hecha').length || 0;
  const totalNotes = appData.notes?.length || 0;
  const totalCategories = appData.categories?.length || 0;

  // Extraer nombre e iniciales
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : '');

  const initials = fullName
    ? fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase())
        .join('')
    : 'U';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      if (onDataRestored) onDataRestored();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Encabezado superior tipo Calma */}
      <div>
        <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 text-calma-muted text-[13px] sm:text-[14px] tracking-wide font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-1.5 text-calma-ink hover:opacity-80 transition-opacity cursor-pointer flex-none focus:outline-none"
            title="Ir al inicio"
          >
            <img
              src="/icons/IcoRekayu.ico"
              alt="Logo Rekayu"
              className="w-4 h-4 rounded-sm object-contain flex-none"
            />
            <span className="font-semibold text-calma-ink">Rekayu</span>
          </button>
          <span className="text-calma-muted/40 font-light">·</span>
          <span>Cuenta</span>
        </div>
        <h1 className="font-serif font-normal text-[36px] sm:text-[46px] leading-none tracking-[-0.01em] text-calma-ink m-0">
          Mi Perfil
        </h1>
        <p className="text-calma-muted text-[13px] sm:text-[15px] mt-1.5 m-0">
          Identidad, sincronización y estado de tus datos
        </p>
      </div>

      {/* Tarjeta de perfil principal */}
      <section className="bg-calma-surface rounded-3xl p-6 sm:p-7 border border-calma-line shadow-xs space-y-6">
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Avatar grande con iniciales */}
              <div className="w-16 h-16 rounded-2xl bg-calma-accent-soft border border-calma-accent/30 flex items-center justify-center text-calma-accent font-semibold text-[22px] shadow-xs flex-none">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[19px] font-semibold text-calma-ink m-0 leading-tight">
                    {fullName || 'Usuario Rekayu'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En línea
                  </span>
                </div>
                <p className="text-[13.5px] text-calma-muted m-0">{user.email}</p>
                {memberSince && (
                  <p className="text-[12px] text-calma-muted/80 flex items-center gap-1.5 m-0 pt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Miembro desde {memberSince}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-calma-bg border border-calma-line hover:border-calma-warn/60 hover:text-calma-warn text-calma-muted text-[13px] font-medium transition-all shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>{isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-calma-bg border border-calma-line flex items-center justify-center text-calma-muted flex-none">
                <UserIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[19px] font-semibold text-calma-ink m-0 leading-tight">
                    Modo Local
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-calma-bg border border-calma-line text-calma-muted">
                    Sin cuenta
                  </span>
                </div>
                <p className="text-[13.5px] text-calma-muted m-0">
                  Tus datos se guardan únicamente en el navegador de este dispositivo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => (onOpenAuth ? onOpenAuth() : setIsAuthModalOpen(true))}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-calma-accent text-white hover:opacity-95 text-[13.5px] font-medium transition-all shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Iniciar sesión o Registrarse</span>
            </button>
          </div>
        )}

        {/* Separador sutil */}
        <hr className="border-t border-calma-line/60 m-0" />

        {/* Estado de sincronización autónoma (sin botones manuales) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-calma-bg border border-calma-line flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-calma-surface border border-calma-line flex items-center justify-center text-calma-accent flex-none">
              <Cloud className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[13.5px] font-medium text-calma-ink m-0 flex items-center gap-1.5">
                <span>Nube Supabase</span>
                {user ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="text-[11px] font-normal text-calma-muted">(Desconectada)</span>
                )}
              </h3>
              <p className="text-[12px] text-calma-muted leading-relaxed m-0">
                {user
                  ? 'Sincronización en segundo plano activa. Tus cambios se respaldan de forma silenciosa al instante.'
                  : 'Inicia sesión para sincronizar automáticamente con tu iPhone u otros dispositivos.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-calma-bg border border-calma-line flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-calma-surface border border-calma-line flex items-center justify-center text-calma-accent flex-none">
              <HardDrive className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[13.5px] font-medium text-calma-ink m-0 flex items-center gap-1.5">
                <span>Almacenamiento Local (Local-First)</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </h3>
              <p className="text-[12px] text-calma-muted leading-relaxed m-0">
                La app carga y responde a velocidad instantánea sin importar si tienes internet o mala cobertura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resumen de actividad / estadísticas del usuario */}
      <section className="bg-calma-surface rounded-3xl p-6 border border-calma-line shadow-xs space-y-4">
        <h2 className="text-[15px] font-medium text-calma-ink m-0">
          Resumen de tu espacio de trabajo
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-calma-bg border border-calma-line text-center space-y-1">
            <div className="text-[22px] font-semibold text-calma-ink leading-tight">
              {totalTasks}
            </div>
            <div className="text-[11.5px] text-calma-muted flex items-center justify-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tareas creadas</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-calma-bg border border-calma-line text-center space-y-1">
            <div className="text-[22px] font-semibold text-emerald-600 dark:text-emerald-400 leading-tight">
              {completedTasks}
            </div>
            <div className="text-[11.5px] text-calma-muted flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Completadas</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-calma-bg border border-calma-line text-center space-y-1">
            <div className="text-[22px] font-semibold text-calma-accent leading-tight">
              {totalNotes}
            </div>
            <div className="text-[11.5px] text-calma-muted flex items-center justify-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Notas y apuntes</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-calma-bg border border-calma-line text-center space-y-1">
            <div className="text-[22px] font-semibold text-calma-ink leading-tight">
              {totalCategories}
            </div>
            <div className="text-[11.5px] text-calma-muted">Categorías activas</div>
          </div>
        </div>
      </section>

      {/* Privacidad y Garantía de datos */}
      <section className="bg-calma-surface/60 rounded-3xl p-5 sm:p-6 border border-calma-line/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-calma-accent mt-0.5 flex-none" />
          <div className="space-y-0.5">
            <h3 className="text-[14px] font-medium text-calma-ink m-0">
              Privacidad y soberanía de tus datos
            </h3>
            <p className="text-[12.5px] text-calma-muted leading-relaxed m-0">
              Tus tareas y notas nunca se venden ni se comparten. Si deseas hacer una copia de seguridad en archivo .json, puedes gestionarla en los Ajustes.
            </p>
          </div>
        </div>

        {onNavigateToSettings && (
          <button
            type="button"
            onClick={onNavigateToSettings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-calma-surface border border-calma-line text-calma-ink hover:border-calma-accent text-[12.5px] font-medium transition-all shadow-xs cursor-pointer flex-none self-start sm:self-auto"
          >
            <span>Ir a Ajustes</span>
            <ArrowRight className="w-3.5 h-3.5 text-calma-muted" />
          </button>
        )}
      </section>

      {/* Aviso de configuración si falta supabase anon key */}
      {!isConfigured && (
        <div className="p-4 rounded-2xl bg-calma-warn/10 border border-calma-warn/30 text-calma-ink text-[13px] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-calma-warn flex-none mt-0.5" />
          <p className="m-0 leading-relaxed text-calma-muted">
            Para activar la sincronización con Supabase, añade tu clave en{' '}
            <code className="bg-calma-bg px-1 py-0.5 rounded text-[12px] text-calma-ink">
              .env.local
            </code>{' '}
            (<code className="bg-calma-bg px-1 py-0.5 rounded text-[12px] text-calma-ink">
              VITE_SUPABASE_ANON_KEY
            </code>
            ).
          </p>
        </div>
      )}

      {/* Modal de Autenticación (solo si no se proporciona onOpenAuth global) */}
      {!onOpenAuth && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            if (onDataRestored) onDataRestored();
          }}
        />
      )}
    </div>
  );
};
