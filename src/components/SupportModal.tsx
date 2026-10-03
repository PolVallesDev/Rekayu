import React, { useState, useEffect } from 'react';
import { Heart, Coffee, Share2, MessageSquare, X, Check, ExternalLink } from 'lucide-react';
import { NavSection } from '../types';
import { getSupportConfig, SupportConfig } from '../lib/storage';

interface SupportModalProps {
  activeNav: NavSection;
  isPanelOpen?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isPanelOpen = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [config, setConfig] = useState<SupportConfig>(getSupportConfig);

  useEffect(() => {
    setConfig(getSupportConfig());
  }, [isMobileOpen, showInfo]);

  const handleShare = async () => {
    const shareData = {
      title: 'Rekayu · Calma y Foco',
      text: 'Organizador personal de tareas, calendario y apuntes para estudiantes y creadores.',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Si el usuario cancela la hoja nativa en móvil, continuamos
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setShowInfo(false);
      setTimeout(() => setCopied(false), 2800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2800);
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. VERSIÓN PC (Escritorio `sm:` en adelante): Botones directos abajo izq */}
      {/* ========================================================================= */}
      {!isPanelOpen && (
        <aside
          className="hidden sm:flex fixed bottom-5 left-6 z-30 select-none"
          aria-label="Apoyo y enlaces de contacto"
        >
          <div className="relative">
            {/* Globo/tarjeta que aparece justo encima de los botones al hacer clic en info o copiar enlace */}
            {(showInfo || copied) && (
              <div
                className="absolute bottom-full left-0 mb-2.5 w-76 bg-calma-surface rounded-2xl p-4 border border-calma-line shadow-2xl animate-page-popup space-y-2.5 z-40 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/icons/LogoRekayu.webp"
                      alt="Rekayu"
                      className="w-4 h-4 rounded-sm object-contain"
                    />
                    <span className="text-[13px] font-semibold text-calma-ink">Proyecto Indie</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowInfo(false);
                      setCopied(false);
                    }}
                    className="p-1 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg transition-colors"
                    aria-label="Cerrar mensaje"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {copied ? (
                  <div className="p-2.5 rounded-xl bg-calma-accent-soft text-calma-ink text-[12px] font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-calma-accent flex-none" />
                    <span>¡Enlace copiado al portapapeles! ✨</span>
                  </div>
                ) : (
                  <p className="text-[12px] text-calma-muted leading-relaxed m-0">
                    Rekayu es una aplicación personal sin publicidad ni algoritmos. Creada por un desarrollador y estudiante para tu foco y serenidad diaria.
                  </p>
                )}
              </div>
            )}

            {/* Píldora de botones directos en PC */}
            <div className="flex items-center gap-1 bg-calma-surface/90 hover:bg-calma-surface backdrop-blur-md border border-calma-line rounded-full shadow-calma p-1.5 transition-all">
              {/* Botón de Café (si está activado) */}
              {config.enableBuyCoffee && (
                <a
                  href={config.buyCoffeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Invitar a un café"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12.5px] font-medium text-calma-ink hover:text-calma-accent hover:bg-calma-accent-soft/60 transition-all group"
                >
                  <Coffee className="w-4 h-4 text-calma-accent group-hover:scale-110 transition-transform flex-none" />
                  <span className="text-[12px]">Invitar a un café</span>
                </a>
              )}

              {config.enableBuyCoffee && <div className="w-[1px] h-4 bg-calma-line mx-0.5" />}

              {/* Botón Compartir */}
              <button
                type="button"
                onClick={handleShare}
                title="Compartir enlace de Rekayu"
                className="p-1.5 text-calma-muted hover:text-calma-ink hover:bg-calma-bg rounded-full transition-all cursor-pointer"
                aria-label="Compartir enlace"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-calma-accent" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {/* Botón Contacto / Incidencias */}
              <a
                href={`mailto:${config.contactEmail}?subject=${encodeURIComponent(
                  '[Rekayu] Feedback o Incidencia'
                )}`}
                title="Escribir feedback o reportar error"
                aria-label="Contacto e incidencias"
                className="p-1.5 text-calma-muted hover:text-calma-ink hover:bg-calma-bg rounded-full transition-all"
              >
                <MessageSquare className="w-4 h-4" />
              </a>

              {/* Botón Info / Corazón (muestra el texto justo encima) */}
              <button
                type="button"
                onClick={() => {
                  setCopied(false);
                  setShowInfo(!showInfo);
                }}
                title="Sobre el proyecto independiente"
                aria-label="Información del proyecto"
                className="p-1.5 text-calma-warn hover:bg-calma-warn/10 rounded-full transition-all cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    showInfo ? 'fill-calma-warn' : 'fill-calma-warn/25'
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 2. VERSIÓN MÓVIL: Ventana modal al pulsar el botón del header en móvil   */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={onCloseMobile}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-calma-surface rounded-2xl p-5 border border-calma-line shadow-2xl space-y-4 animate-page-popup mb-4"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-2 border-b border-calma-line/60">
              <div className="flex items-center gap-2">
                <img
                  src="/icons/LogoRekayu.webp"
                  alt="Logo Rekayu"
                  className="w-5 h-5 rounded-md object-contain"
                />
                <div>
                  <h3 className="text-[15px] font-medium text-calma-ink m-0 leading-tight">
                    Apoyar Rekayu
                  </h3>
                  <span className="text-[11px] text-calma-muted">Proyecto independiente</span>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg transition-colors"
                aria-label="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensaje de creador */}
            <p className="text-[12.5px] text-calma-muted leading-relaxed m-0">
              Rekayu es un proyecto personal, gratuito y sin anuncios. Si la herramienta te ayuda en tu día a día, cualquier gesto de apoyo es bienvenido.
            </p>

            {/* Acciones para móvil */}
            <div className="space-y-2 pt-1">
              {/* 1. Invitar a un café si está activado */}
              {config.enableBuyCoffee && (
                <a
                  href={config.buyCoffeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-calma-accent-soft/50 hover:bg-calma-accent-soft border border-calma-accent/30 text-calma-ink transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-calma-accent/15 flex items-center justify-center text-calma-accent flex-none">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-medium m-0 leading-tight">Invitar a un café</p>
                      <p className="text-[11px] text-calma-muted m-0 mt-0.5">Apoya el proyecto</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-calma-muted group-hover:text-calma-ink transition-colors flex-none" />
                </a>
              )}

              {/* 2. Compartir la web (abre menú nativo en móvil) */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-calma-bg/60 hover:bg-calma-bg border border-calma-line text-calma-ink transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-calma-surface flex items-center justify-center text-calma-ink border border-calma-line flex-none">
                    {copied ? (
                      <Check className="w-4 h-4 text-calma-accent" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-medium m-0 leading-tight">Compartir la web</p>
                    <p className="text-[11px] text-calma-muted m-0 mt-0.5">
                      {copied ? '¡Enlace copiado al portapapeles! ✨' : 'Recomiéndala a amigos'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-calma-accent px-2 py-0.5 rounded-md bg-calma-surface border border-calma-line shadow-xs">
                  {copied ? '¡Copiado!' : 'Compartir'}
                </span>
              </button>

              {/* 3. Contactar / Incidencias */}
              <a
                href={`mailto:${config.contactEmail}?subject=${encodeURIComponent(
                  '[Rekayu] Feedback o Incidencia'
                )}`}
                className="flex items-center justify-between p-3 rounded-xl bg-calma-bg/60 hover:bg-calma-bg border border-calma-line text-calma-ink transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-calma-surface flex items-center justify-center text-calma-ink border border-calma-line flex-none">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-medium m-0 leading-tight">
                      Contacto e incidencias
                    </p>
                    <p className="text-[11px] text-calma-muted m-0 mt-0.5">Reportar un error o duda</p>
                  </div>
                </div>
                <span className="text-[11.5px] text-calma-muted group-hover:text-calma-ink transition-colors">
                  Escribir
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
