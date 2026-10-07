import React from 'react';
import { ViewType, NavSection } from '../types';
import { getTodayFormattedLong } from '../lib/dates';
import { SyncStatus } from '../hooks/useAuth';

interface HeaderProps {
  activeSection: NavSection;
  activeView: ViewType;
  pendingTasksCount: number;
  pendingRemindersCount: number;
  notesCount: number;
  syncStatus?: SyncStatus;
  onGoHome?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  activeView,
  pendingTasksCount,
  pendingRemindersCount,
  notesCount,
  syncStatus = 'local',
  onGoHome,
  onOpenAuth,
}) => {
  const todayFormatted = getTodayFormattedLong();

  // Título dinámico en Instrument Serif
  let title = 'Hoy';
  let summary = pendingTasksCount === 0 ? 'Todo al día' : `${pendingTasksCount} tareas pendientes`;

  if (activeSection === 'tareas') {
    if (activeView === 'proximos') {
      title = 'Próximos';
      summary = 'Plazos y entregas futuras';
    } else if (activeView === 'hechas') {
      title = 'Hechas';
      summary = 'Tareas completadas';
    } else if (activeView === 'todas') {
      title = 'Todas';
      summary = pendingTasksCount === 0 ? 'Todo al día' : `${pendingTasksCount} pendientes`;
    }
  } else if (activeSection === 'recordatorios') {
    title = 'Recordatorios';
    summary =
      pendingRemindersCount === 0
        ? 'Todo al día'
        : `${pendingRemindersCount} recordatorios pendientes`;
  } else if (activeSection === 'notas') {
    title = 'Notas';
    summary = `${notesCount} notas y apuntes`;
  }

  return (
    <header className="mb-3 select-none">
      {/* 1. Fila superior: Marca Rekayu + Fecha + Estado de Sincronización */}
      <div className="mb-1 sm:mb-2 flex items-center justify-between text-calma-muted text-[13px] sm:text-[14px] tracking-wide font-medium">
        <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
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
          <span className="capitalize overflow-hidden text-ellipsis">{todayFormatted}</span>
        </div>

        {/* Indicador sereno de sincronización o modo local */}
        <div className="flex-none pl-2">
          {syncStatus === 'synced' ? (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] text-calma-muted/80"
              title="Sincronizado con la nube"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="hidden sm:inline">Sincronizado</span>
            </span>
          ) : syncStatus === 'syncing' ? (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] text-calma-muted"
              title="Sincronizando con tus otros dispositivos..."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Sincronizando...</span>
            </span>
          ) : syncStatus === 'offline' ? (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] text-calma-muted/70"
              title="Sin conexión a internet (modo local temporal)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-calma-muted" />
              <span className="hidden sm:inline">Sin conexión</span>
            </span>
          ) : onOpenAuth ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 text-[11px] text-calma-muted hover:text-calma-accent transition-colors cursor-pointer"
              title="Modo local (solo este dispositivo). Pulsa aquí para iniciar sesión y sincronizar."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-calma-muted/60" />
              <span>Modo local</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* 2. Título Serif + Subtítulo limpio y despejado */}
      <div>
        <h1 className="font-serif font-normal text-[36px] sm:text-[48px] md:text-[54px] leading-none tracking-[-0.01em] text-calma-ink m-0 select-none truncate">
          {title}
        </h1>
        <p className="text-calma-muted text-[13px] sm:text-[15px] mt-1.5 sm:mt-2 m-0 truncate">
          {summary}
        </p>
      </div>
    </header>
  );
};
