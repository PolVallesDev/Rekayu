import React, { useRef, useState } from 'react';
import {
  Sun,
  Moon,
  Download,
  Upload,
  Plus,
  CheckCircle,
  AlertCircle,
  Database,
  Palette,
  Tag,
  Info,
  Heart,
  Coffee,
  Cloud,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { Category } from '../types';
import {
  exportAppDataAsJSON,
  importAppDataFromJSON,
  getSupportConfig,
  saveSupportConfig,
  SupportConfig,
} from '../lib/storage';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

interface SettingsPageProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
  categories: Category[];
  onOpenCategoryModal: () => void;
  onDataRestored: () => void;
  onGoHome?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDark,
  onToggleDarkMode,
  categories,
  onOpenCategoryModal,
  onDataRestored,
  onGoHome,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [supportConfig, setSupportConfig] = useState<SupportConfig>(getSupportConfig);

  const { user, isConfigured, signOut, syncWithCloud } = useAuth(onDataRestored);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const res = await syncWithCloud();
    setSyncFeedback(res.message);
    setIsSyncing(false);
    if (res.success) {
      onDataRestored();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSyncFeedback('Sesión cerrada correctamente.');
    } catch {}
  };

  const handleToggleBuyCoffee = () => {
    const nextVal = !supportConfig.enableBuyCoffee;
    const updated = saveSupportConfig({ enableBuyCoffee: nextVal });
    setSupportConfig(updated);
  };

  const handleExport = () => {
    try {
      exportAppDataAsJSON();
      setFeedback({
        type: 'success',
        message: 'Copia de seguridad descargada correctamente en formato JSON.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Hubo un error al generar la copia de seguridad.',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setFeedback(null);

    const result = await importAppDataFromJSON(file);
    setLoading(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      onDataRestored();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Encabezado de la página */}
      <div>
        <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 text-calma-muted text-[13px] sm:text-[14px] tracking-wide font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-1.5 text-calma-ink hover:opacity-80 transition-opacity cursor-pointer flex-none focus:outline-none"
            title="Ir al inicio"
          >
            <img src="/icons/IcoRekayu.ico" alt="Logo Rekayu" className="w-4 h-4 rounded-sm object-contain flex-none" />
            <span className="font-semibold text-calma-ink">Rekayu</span>
          </button>
          <span className="text-calma-muted/40 font-light">·</span>
          <span>Preferencias</span>
        </div>
        <h1 className="font-serif font-normal text-[36px] sm:text-[46px] leading-none tracking-[-0.01em] text-calma-ink m-0">
          Ajustes
        </h1>
        <p className="text-calma-muted text-[13px] sm:text-[15px] mt-1.5 m-0">
          Personalización, categorías y copias de seguridad
        </p>
      </div>

      {/* Mensaje de feedback si se exportó o importó */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-[13px] font-medium flex items-start gap-2.5 border transition-all ${
            feedback.type === 'success'
              ? 'bg-calma-accent-soft border-calma-accent text-calma-ink'
              : 'bg-calma-warn/10 border-calma-warn text-calma-warn'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-calma-accent" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-calma-warn" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Bloque: Apariencia */}
      <section className="bg-calma-surface rounded-2xl p-5 border border-calma-line shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-calma-accent" />
          <h2 className="text-[15px] font-medium text-calma-ink m-0">Apariencia</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (isDark) onToggleDarkMode();
            }}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center ${
              !isDark
                ? 'bg-calma-bg border-calma-accent ring-1 ring-calma-accent text-calma-ink shadow-xs'
                : 'bg-calma-surface border-calma-line text-calma-muted hover:text-calma-ink'
            }`}
          >
            <Sun className="w-5 h-5 mb-1.5 text-amber-500" />
            <span className="text-[13px] font-medium">Modo Claro</span>
            <span className="text-[11px] text-calma-muted mt-0.5">Estética Calma</span>
          </button>

          <button
            onClick={() => {
              if (!isDark) onToggleDarkMode();
            }}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center ${
              isDark
                ? 'bg-calma-bg border-calma-accent ring-1 ring-calma-accent text-calma-ink shadow-xs'
                : 'bg-calma-surface border-calma-line text-calma-muted hover:text-calma-ink'
            }`}
          >
            <Moon className="w-5 h-5 mb-1.5 text-calma-accent" />
            <span className="text-[13px] font-medium">Modo Oscuro</span>
            <span className="text-[11px] text-calma-muted mt-0.5">Descanso visual</span>
          </button>
        </div>
      </section>

      {/* 2. Bloque: Categorías */}
      <section className="bg-calma-surface rounded-2xl p-5 border border-calma-line shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-calma-accent" />
            <h2 className="text-[15px] font-medium text-calma-ink m-0">Categorías activas</h2>
          </div>
          <button
            onClick={onOpenCategoryModal}
            className="flex items-center gap-1 text-[12.5px] font-medium text-calma-accent hover:opacity-85 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-calma-bg border border-calma-line text-[13px] text-calma-ink"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-none"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Bloque: Sincronización en la Nube (Supabase) */}
      <section className="bg-calma-surface rounded-2xl p-5 border border-calma-line shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-calma-accent" />
            <h2 className="text-[15px] font-medium text-calma-ink m-0">
              Sincronización en la Nube
            </h2>
          </div>
          {user && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado
            </span>
          )}
        </div>

        <p className="text-[13px] text-calma-muted leading-relaxed m-0">
          Sincroniza tus tareas, categorías, notas y recordatorios en tiempo real entre tu iPhone, iPad y ordenador de forma privada.
        </p>

        {syncFeedback && (
          <div className="p-3 rounded-xl bg-calma-accent-soft text-calma-ink text-[12.5px] font-medium flex items-center gap-2 border border-calma-accent/30 animate-in fade-in duration-150">
            <CheckCircle className="w-4 h-4 text-calma-accent flex-none" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {!isConfigured ? (
          <div className="p-3.5 bg-calma-bg/60 rounded-xl border border-calma-line flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-calma-warn flex-none mt-0.5" />
            <p className="text-[12.5px] text-calma-muted leading-relaxed m-0">
              Falta configurar tu clave en <code className="bg-calma-bg px-1 py-0.5 rounded text-[12px] text-calma-ink">.env.local</code>. Añade <code className="bg-calma-bg px-1 py-0.5 rounded text-[12px] text-calma-ink">VITE_SUPABASE_ANON_KEY</code> con el valor de tu panel de Supabase.
            </p>
          </div>
        ) : user ? (
          <div className="space-y-3 pt-1">
            <div className="p-3.5 bg-calma-bg/60 rounded-xl border border-calma-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[13.5px] font-medium text-calma-ink m-0 leading-tight">
                  {user.email}
                </p>
                <p className="text-[11.5px] text-calma-muted m-0 mt-0.5">
                  Conectado a tu base de datos Supabase
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncCloud}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-calma-surface border border-calma-line hover:border-calma-accent text-calma-ink text-[12px] font-medium transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Sincronizar cambios ahora"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-calma-accent ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-calma-surface border border-calma-line hover:border-calma-warn text-calma-muted hover:text-calma-warn text-[12px] font-medium transition-all cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-calma-bg/60 rounded-xl border border-calma-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[13.5px] font-medium text-calma-ink m-0 leading-tight">
                Accede a tu cuenta de Rekayu
              </p>
              <p className="text-[12px] text-calma-muted m-0 mt-0.5">
                Inicia sesión o regístrate para activar la sincronización automática.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-calma-accent text-white font-medium text-[13px] rounded-xl hover:opacity-95 shadow-xs transition-all cursor-pointer flex-none text-center"
            >
              Iniciar sesión / Registrarse
            </button>
          </div>
        )}
      </section>

      {/* 4. Bloque: Almacenamiento y Copia de Seguridad */}
      <section className="bg-calma-surface rounded-2xl p-5 border border-calma-line shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-calma-accent" />
          <h2 className="text-[15px] font-medium text-calma-ink m-0">
            Almacenamiento y Respaldos
          </h2>
        </div>

        <p className="text-[13px] text-calma-muted leading-relaxed m-0">
          Tus datos se guardan de forma privada y local en este dispositivo (<code className="text-calma-ink text-[12px] bg-calma-bg px-1.5 py-0.5 rounded">localStorage</code>). Puedes exportar una copia completa en JSON o importarla cuando desees.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Exportar */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-3 bg-calma-bg hover:bg-calma-bg/80 text-calma-ink rounded-xl border border-calma-line text-[13px] font-medium transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-calma-accent" />
            <span>Exportar Copia (.json)</span>
          </button>

          {/* Importar */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center justify-center gap-2 p-3 bg-calma-accent text-white hover:opacity-95 rounded-xl text-[13px] font-medium transition-all shadow-xs disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{loading ? 'Restaurando...' : 'Importar Copia (.json)'}</span>
          </button>
        </div>
      </section>

      {/* 4. Bloque: Apoyo y Proyecto Indie */}
      <section className="bg-calma-surface rounded-2xl p-5 border border-calma-line shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-calma-warn" />
          <h2 className="text-[15px] font-medium text-calma-ink m-0">
            Apoyo y Proyecto Indie
          </h2>
        </div>

        <p className="text-[13px] text-calma-muted leading-relaxed m-0">
          Rekayu es un desarrollo independiente y gratuito sin publicidad. Puedes activar o desactivar la opción de donación ("Invitar a un café") en la ventana de apoyo según desees.
        </p>

        {/* Interruptor de Buy Me a Coffee */}
        <div className="flex items-center justify-between p-3.5 bg-calma-bg/60 rounded-xl border border-calma-line">
          <div className="flex items-center gap-2.5 mr-3">
            <Coffee className="w-4 h-4 text-calma-accent flex-none" />
            <div>
              <p className="text-[13.5px] font-medium text-calma-ink m-0">
                Opción de "Invitar a un café"
              </p>
              <p className="text-[11.5px] text-calma-muted m-0 mt-0.5">
                {supportConfig.enableBuyCoffee
                  ? 'Activado: se muestra el botón en la ventana de apoyo'
                  : 'Desactivado: oculto, sin solicitudes de donación'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleBuyCoffee}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer flex-none ${
              supportConfig.enableBuyCoffee ? 'bg-calma-accent' : 'bg-calma-muted/30'
            }`}
            aria-label="Alternar opción de donación"
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
                supportConfig.enableBuyCoffee ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* 5. Bloque: Información de la versión */}
      <section className="bg-calma-surface/60 rounded-2xl p-5 border border-calma-line/60">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-calma-muted mt-0.5 flex-none" />
          <div className="space-y-1">
            <h3 className="text-[13.5px] font-medium text-calma-ink m-0">
              Rekayu · Versión Beta v3
            </h3>
            <p className="text-[12px] text-calma-muted leading-relaxed m-0">
              Diseñado con estética Calma para el perfil híbrido de estudiante universitario y emprendedor. Toda la persistencia pasa por <code className="text-calma-ink">src/lib/storage.ts</code>, sincronizada en la nube con Supabase.
            </p>
          </div>
        </div>
      </section>

      {/* Modal de Autenticación con Supabase */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          onDataRestored();
        }}
      />
    </div>
  );
};
