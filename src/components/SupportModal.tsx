import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Coffee,
  Share2,
  MessageSquare,
  X,
  Check,
  ExternalLink,
  Mail,
  Copy,
} from 'lucide-react';
import { NavSection } from '../types';
import { getSupportConfig, SupportConfig } from '../lib/storage';

interface SupportModalProps {
  activeNav: NavSection;
  isPanelOpen?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

type PopoverView = 'about' | 'contact' | 'share' | null;

export const SupportModal: React.FC<SupportModalProps> = ({
  isPanelOpen = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [activePopover, setActivePopover] = useState<PopoverView>(null);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [config, setConfig] = useState<SupportConfig>(getSupportConfig);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConfig(getSupportConfig());
  }, [isMobileOpen, activePopover]);

  // Cierre al pulsar Escape o al hacer clic fuera
  useEffect(() => {
    if (!activePopover) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePopover(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePopover]);

  const handleToggle = (view: PopoverView) => {
    setActivePopover((prev) => (prev === view ? null : view));
  };

  const handleCopyEmail = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (config.contactEmail) {
      navigator.clipboard.writeText(config.contactEmail).catch(() => {});
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2200);
    }
  };

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
        // En caso de que el usuario cierre el diálogo nativo
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setActivePopover('share');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setActivePopover('share');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. VERSIÓN PC (Escritorio `sm:` en adelante): Botones directos abajo izq */}
      {/* ========================================================================= */}
      {!isPanelOpen && (
        <aside
          ref={containerRef}
          className="hidden sm:flex fixed bottom-5 left-6 z-30 select-none"
          aria-label="Apoyo y enlaces de contacto"
        >
          <div className="relative">
            {/* Tarjeta flotante interactiva */}
            {activePopover && (
              <div
                className="absolute bottom-full left-0 mb-3 w-[315px] bg-calma-surface/95 backdrop-blur-md rounded-2xl p-4 border border-calma-line shadow-2xl animate-page-popup space-y-3 z-40 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1.1 Card: Contacto e Incidencias */}
                {activePopover === 'contact' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-calma-line/60">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-calma-accent-soft flex items-center justify-center text-calma-accent flex-none">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-[13.5px] font-medium text-calma-ink m-0">
                          Contacto e Incidencias
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePopover(null)}
                        className="p-1 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg transition-colors cursor-pointer"
                        aria-label="Cerrar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[12.5px] text-calma-muted leading-relaxed m-0">
                      ¿Tienes alguna sugerencia de mejora, duda o has encontrado algún problema? Tu opinión es clave para seguir mejorando.
                    </p>

                    <div className="space-y-2 pt-0.5">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-calma-bg/70 border border-calma-line">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <Mail className="w-3.5 h-3.5 text-calma-muted flex-none" />
                          <span className="text-[12px] font-mono text-calma-ink truncate select-all">
                            {config.contactEmail}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer flex-none ${
                            emailCopied
                              ? 'bg-calma-accent text-white border-calma-accent shadow-xs'
                              : 'bg-calma-surface text-calma-ink hover:text-calma-accent border-calma-line hover:border-calma-accent/40 shadow-xs'
                          }`}
                          title="Copiar correo"
                        >
                          {emailCopied ? (
                            <>
                              <Check className="w-3 h-3 flex-none" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 flex-none" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <a
                        href={`mailto:${config.contactEmail}?subject=${encodeURIComponent(
                          '[Rekayu] Feedback o Incidencia'
                        )}`}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-calma-accent text-white hover:opacity-95 text-[12.5px] font-medium transition-all shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Escribir correo directo</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  </>
                )}

                {/* 1.2 Card: Sobre Rekayu (Corazón) */}
                {activePopover === 'about' && (
                  <>
                    

                    <p className="text-[12.5px] text-calma-muted leading-relaxed m-0">
                      Rekayu es una aplicación personal sin ruido mental, publicidad ni algoritmos. Creada con estética <span className="text-calma-ink font-medium">Calma</span> para acompañarte en tu estudio y proyectos con serenidad y foco diario.
                    </p>

                    {config.enableBuyCoffee && (
                      <a
                        href={config.buyCoffeeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-calma-accent-soft/50 hover:bg-calma-accent-soft border border-calma-accent/30 text-calma-ink transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4 text-calma-accent flex-none" />
                          <span className="text-[12px] font-medium">Invitar a un café</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-calma-muted group-hover:text-calma-accent transition-colors flex-none" />
                      </a>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[11px] text-calma-muted/80 border-t border-calma-line/50">
                      <span>Versión 1.0</span>
                      <span className="flex items-center gap-1">
                        Hecho con <Heart className="w-3 h-3 text-calma-warn fill-calma-warn inline" /> para tu foco
                      </span>
                    </div>
                  </>
                )}

                {/* 1.3 Card: Compartir enlace */}
                {activePopover === 'share' && (
                  <>
                    <div className="flex items-center justify-between pb-1.5 border-b border-calma-line/60">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-calma-accent-soft flex items-center justify-center text-calma-accent flex-none">
                          <Share2 className="w-3 h-3" />
                        </div>
                        <h4 className="text-[13px] font-medium text-calma-ink m-0">Compartir</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePopover(null)}
                        className="p-1 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg transition-colors cursor-pointer"
                        aria-label="Cerrar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-calma-accent-soft text-calma-ink text-[12px] font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-calma-accent flex-none" />
                      <span>¡Enlace copiado al portapapeles!</span>
                    </div>

                    <p className="text-[11.5px] text-calma-muted m-0 leading-relaxed">
                      Comparte Rekayu con otros estudiantes o creadores que busquen organizar su día sin sobrecarga mental.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Píldora de botones directos en PC */}
            <div className="flex items-center gap-1 bg-calma-surface/90 hover:bg-calma-surface backdrop-blur-md border border-calma-line rounded-full shadow-calma p-1.5 transition-all">
              {/* Botón de Café (si está activado en código) */}
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
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  activePopover === 'share' || copied
                    ? 'text-calma-accent bg-calma-accent-soft shadow-xs'
                    : 'text-calma-muted hover:text-calma-ink hover:bg-calma-bg'
                }`}
                aria-label="Compartir enlace"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-calma-accent" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {/* Botón Contacto / Incidencias */}
              <button
                type="button"
                onClick={() => handleToggle('contact')}
                title="Contacto e incidencias"
                aria-label="Contacto e incidencias"
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  activePopover === 'contact'
                    ? 'text-calma-accent bg-calma-accent-soft shadow-xs'
                    : 'text-calma-muted hover:text-calma-ink hover:bg-calma-bg'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Botón Info / Corazón */}
              <button
                type="button"
                onClick={() => handleToggle('about')}
                title="Sobre el proyecto independiente"
                aria-label="Información del proyecto"
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  activePopover === 'about'
                    ? 'text-calma-warn bg-calma-warn/15 shadow-xs'
                    : 'text-calma-warn hover:bg-calma-warn/10'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    activePopover === 'about' ? 'fill-calma-warn' : 'fill-calma-warn/25'
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
                    Sobre Rekayu
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
              Rekayu nace como un espacio personal sin ruido mental ni distracciones. Creado con filosofía Calma para acompañar tu estudio y proyectos con serenidad y orden diario.
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
              <div className="p-3 rounded-xl bg-calma-bg/60 border border-calma-line space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                    <div className="w-8 h-8 rounded-lg bg-calma-surface flex items-center justify-center text-calma-ink border border-calma-line flex-none">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-[13px] font-medium m-0 leading-tight">
                        Contacto e incidencias
                      </p>
                      <p className="text-[11px] text-calma-muted m-0 mt-0.5 truncate">
                        {config.contactEmail}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="text-[11.5px] font-medium px-2.5 py-1 rounded-md bg-calma-surface border border-calma-line text-calma-ink shadow-xs transition-colors flex-none cursor-pointer"
                  >
                    {emailCopied ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>

                <a
                  href={`mailto:${config.contactEmail}?subject=${encodeURIComponent(
                    '[Rekayu] Feedback o Incidencia'
                  )}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-calma-accent text-white text-[12px] font-medium transition-all shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Enviar correo</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
