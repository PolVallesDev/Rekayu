import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cloud, HardDrive, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const handleContinueLocal = () => {
    try {
      localStorage.setItem('rekayu_welcome_dismissed', 'true');
    } catch {
      // Ignorar si el almacenamiento local está restringido
    }
    onClose();
  };

  const handleOpenAuth = () => {
    try {
      localStorage.setItem('rekayu_welcome_dismissed', 'true');
    } catch {
      // Ignorar
    }
    onClose();
    onOpenAuth();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={handleContinueLocal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-calma-surface rounded-3xl p-6 sm:p-7 border border-calma-line shadow-2xl space-y-6 animate-page-popup relative overflow-hidden"
      >
        {/* Botón cerrar sutil */}
        <button
          type="button"
          onClick={handleContinueLocal}
          className="absolute top-5 right-5 p-1.5 text-calma-muted hover:text-calma-ink rounded-xl hover:bg-calma-bg transition-colors cursor-pointer"
          aria-label="Cerrar bienvenida"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabecera / Marca */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-13 h-13 mx-auto rounded-2xl bg-calma-accent-soft flex items-center justify-center text-calma-accent shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-calma-ink tracking-tight m-0">
              Te damos la bienvenida a Rekayu
            </h2>
            <p className="text-[13.5px] text-calma-muted m-0 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Tu espacio para organizar tareas, proyectos y notas con claridad y sin fricción.
            </p>
          </div>
        </div>

        {/* Tarjetas comparativas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-calma-bg border border-calma-line/70 flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2 text-calma-accent">
              <Cloud className="w-4 h-4" />
              <span className="text-[12.5px] font-semibold">Con cuenta</span>
            </div>
            <p className="text-[11.5px] text-calma-muted m-0 leading-relaxed">
              Sincronización automática entre tu iPhone, tablet y ordenador. Copia de seguridad en la nube.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-calma-bg border border-calma-line/70 flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2 text-calma-muted">
              <HardDrive className="w-4 h-4" />
              <span className="text-[12.5px] font-semibold text-calma-ink">Modo local</span>
            </div>
            <p className="text-[11.5px] text-calma-muted m-0 leading-relaxed">
              Tus datos se quedan solo en este dispositivo. Privacidad absoluta, sin registro previo.
            </p>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleOpenAuth}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-calma-accent text-white font-medium text-[14px] rounded-xl hover:opacity-95 transition-all shadow-xs cursor-pointer"
          >
            <span>Iniciar sesión o Registrarse</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleContinueLocal}
            className="w-full py-2.5 px-4 bg-transparent text-calma-muted hover:text-calma-ink text-[13px] font-medium rounded-xl hover:bg-calma-bg transition-colors cursor-pointer text-center"
          >
            Continuar sin cuenta (Modo local)
          </button>
        </div>

        {/* Pie informativo */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-calma-muted/80 pt-1 border-t border-calma-line/40">
          <ShieldCheck className="w-3.5 h-3.5 text-calma-accent" />
          <span>Siempre podrás crear tu cuenta o iniciar sesión más adelante en tu perfil.</span>
        </div>
      </div>
    </div>
  );
};
