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
  Trash2,
} from 'lucide-react';
import { Category } from '../types';
import {
  exportAppDataAsJSON,
  importAppDataFromJSON,
  getSupportConfig,
  saveSupportConfig,
  SupportConfig,
} from '../lib/storage';
import { ConfirmModal } from './ConfirmModal';

interface SettingsPageProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
  categories: Category[];
  onOpenCategoryModal: () => void;
  onDeleteCategory?: (categoryId: string) => boolean;
  onDataRestored: () => void;
  onGoHome?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDark,
  onToggleDarkMode,
  categories,
  onOpenCategoryModal,
  onDeleteCategory,
  onDataRestored,
  onGoHome,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [supportConfig, setSupportConfig] = useState<SupportConfig>(getSupportConfig);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

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
          {categories.map((cat) => {
            const canDelete = categories.length > 1;
            return (
              <div
                key={cat.id}
                className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-calma-bg border border-calma-line text-[13px] text-calma-ink"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-none"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium">{cat.name}</span>
                {canDelete && onDeleteCategory && (
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-1 rounded-md text-calma-muted/60 hover:text-calma-warn hover:bg-calma-warn/10 transition-colors ml-0.5 cursor-pointer"
                    title={`Eliminar categoría ${cat.name}`}
                    aria-label={`Eliminar categoría ${cat.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Bloque: Almacenamiento y Copia de Seguridad */}
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
              Rekayu · Versión 1.0
            </h3>
            <p className="text-[12px] text-calma-muted leading-relaxed m-0">
              Diseñado con estética Calma para el perfil híbrido de estudiante universitario y emprendedor. Toda la persistencia pasa por <code className="text-calma-ink">src/lib/storage.ts</code>, sincronizada en la nube con Supabase.
            </p>
          </div>
        </div>
      </section>

      {/* Modal de confirmación para eliminar categoría */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Eliminar categoría"
        message={
          categoryToDelete
            ? `¿Estás seguro de que deseas eliminar «${categoryToDelete.name}»? Las tareas que la tengan pasarán a la categoría «${
                categories.find((c) => c.id !== categoryToDelete.id)?.name || 'General'
              }».`
            : undefined
        }
        confirmText="Eliminar categoría"
        cancelText="Conservar"
        isDanger={true}
        onConfirm={() => {
          if (categoryToDelete && onDeleteCategory) {
            onDeleteCategory(categoryToDelete.id);
            setFeedback({
              type: 'success',
              message: `Categoría «${categoryToDelete.name}» eliminada correctamente.`,
            });
          }
          setCategoryToDelete(null);
        }}
        onClose={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
