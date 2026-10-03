import React from 'react';
import { ViewType, NavSection } from '../types';
import { getTodayFormattedLong } from '../lib/dates';

interface HeaderProps {
  activeSection: NavSection;
  activeView: ViewType;
  pendingTasksCount: number;
  pendingRemindersCount: number;
  notesCount: number;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  activeView,
  pendingTasksCount,
  pendingRemindersCount,
  notesCount,
  onGoHome,
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
      summary = `${pendingTasksCount} pendientes`;
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
      {/* 1. Fila superior: Marca Rekayu + Fecha */}
      <div className="mb-1 sm:mb-2 flex items-center gap-1.5 text-calma-muted text-[13px] sm:text-[14px] tracking-wide font-medium whitespace-nowrap overflow-hidden text-ellipsis">
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
