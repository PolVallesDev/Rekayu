import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  CheckCircle,
  LogOut,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckSquare,
  FileText,
  AlertCircle,
  ArrowRight,
  Pencil,
  Check,
  RefreshCw,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { SyncStatus } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { getAppData } from '../lib/storage';

export interface AccountPageProps {
  onGoHome?: () => void;
  onDataRestored?: () => void;
  onNavigateToSettings?: () => void;
  onOpenAuth?: () => void;
  currentUser?: User | null;
  isConfigured?: boolean;
  syncStatus?: SyncStatus;
  lastSyncedAt?: Date | null;
  onSignOut?: () => Promise<void>;
  onUpdateProfile?: (fullName: string) => Promise<User | null>;
  onSyncNow?: () => Promise<{ success: boolean; message: string }>;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onGoHome,
  onDataRestored,
  onNavigateToSettings,
  onOpenAuth,
  currentUser = null,
  isConfigured = true,
  syncStatus = 'local',
  lastSyncedAt = null,
  onSignOut,
  onUpdateProfile,
  onSyncNow,
}) => {
  const user = currentUser;
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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

  useEffect(() => {
    setNameInput(fullName);
  }, [fullName]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !onUpdateProfile) return;
    setIsSavingName(true);
    setFeedbackMessage(null);
    try {
      await onUpdateProfile(nameInput.trim());
      setIsEditing(false);
      setFeedbackMessage('Nombre actualizado correctamente.');
      setTimeout(() => setFeedbackMessage(null), 3000);
      if (onDataRestored) onDataRestored();
    } catch {
      setFeedbackMessage('No se pudo actualizar el nombre.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSignOut = async () => {
    if (!onSignOut) return;
    setIsSigningOut(true);
    try {
      await onSignOut();
      if (onDataRestored) onDataRestored();
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleManualSync = async () => {
    if (!onSyncNow) return;
    setIsSyncingManual(true);
    setFeedbackMessage(null);
    try {
      const res = await onSyncNow();
      setFeedbackMessage(res.message);
      setTimeout(() => setFeedbackMessage(null), 3500);
    } finally {
      setIsSyncingManual(false);
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
          Identidad y estado de sincronización entre tus dispositivos
        </p>
      </div>

      {/* Tarjeta de perfil principal */}
      <section className="bg-calma-surface rounded-3xl p-6 sm:p-7 border border-calma-line shadow-xs">
        {user ? (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                {/* Avatar grande con iniciales */}
                <div className="w-16 h-16 rounded-2xl bg-calma-accent-soft border border-calma-accent/30 flex items-center justify-center text-calma-accent font-semibold text-[22px] shadow-xs flex-none">
                  {initials}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[19px] font-semibold text-calma-ink m-0 leading-tight">
                      {fullName || 'Usuario'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(fullName);
                        setIsEditing(!isEditing);
                      }}
                      className="p-1.5 rounded-lg text-calma-muted hover:text-calma-ink hover:bg-calma-bg transition-colors cursor-pointer"
                      title="Modificar nombre"
                      aria-label="Modificar nombre"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
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

            {/* Formulario de edición rápida de nombre */}
            {isEditing && (
              <form
                onSubmit={handleSaveName}
                className="p-4 rounded-2xl bg-calma-bg border border-calma-line flex flex-col sm:flex-row sm:items-center gap-3 animate-in fade-in duration-200"
              >
                <div className="flex-1">
                  <label htmlFor="edit-name" className="block text-[12px] font-medium text-calma-muted mb-1">
                    Nombre completo o usuario
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full bg-calma-surface border border-calma-line rounded-xl px-3 py-1.5 text-[13.5px] text-calma-ink placeholder:text-calma-muted focus:outline-none focus:ring-1 focus:ring-calma-accent"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2 sm:self-end">
                  <button
                    type="submit"
                    disabled={isSavingName || !nameInput.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-calma-accent text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingName ? 'Guardando...' : 'Guardar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl bg-calma-surface border border-calma-line text-calma-muted hover:text-calma-ink text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Barra de estado de sincronización en la nube */}
            <div className="pt-3 border-t border-calma-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px]">
              <div className="flex items-center gap-2 text-calma-ink">
                {syncStatus === 'synced' ? (
                  <CheckCircle className="w-4 h-4 text-calma-accent flex-none" />
                ) : syncStatus === 'syncing' || isSyncingManual ? (
                  <RefreshCw className="w-3.5 h-3.5 text-calma-accent animate-spin flex-none" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-calma-muted/60 flex-none" />
                )}
                <span className="font-medium">
                  {syncStatus === 'synced'
                    ? 'Sincronizado con Supabase'
                    : syncStatus === 'syncing' || isSyncingManual
                    ? 'Sincronizando con tus otros dispositivos...'
                    : syncStatus === 'offline'
                    ? 'Sin conexión a internet (modo local temporal)'
                    : 'Modo local activo'}
                </span>
                {lastSyncedAt && syncStatus === 'synced' && (
                  <span className="text-calma-muted text-[11.5px]">
                    · {lastSyncedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              {onSyncNow && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncingManual || syncStatus === 'syncing'}
                  className="inline-flex items-center gap-1.5 text-calma-accent hover:opacity-80 transition-opacity cursor-pointer font-medium disabled:opacity-50 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingManual ? 'animate-spin' : ''}`} />
                  <span>{isSyncingManual ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
                </button>
              )}
            </div>

            {feedbackMessage && (
              <p className="text-[12px] text-calma-accent font-medium m-0 animate-in fade-in">
                {feedbackMessage}
              </p>
            )}
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
                    solo este dispositivo
                  </span>
                </div>
                <p className="text-[13px] text-calma-muted m-0 leading-relaxed max-w-md">
                  Tus datos se guardan únicamente en este navegador. Para ver tus tareas en tu móvil, tablet u otro ordenador en tiempo real, inicia sesión o crea tu cuenta gratuita.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => (onOpenAuth ? onOpenAuth() : setIsAuthModalOpen(true))}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-calma-accent text-white hover:opacity-95 text-[13.5px] font-medium transition-all shadow-xs cursor-pointer self-start sm:self-auto flex-none"
            >
              <Sparkles className="w-4 h-4" />
              <span>Iniciar sesión o Registrarse</span>
            </button>
          </div>
        )}
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
