import React from 'react';
import { Sun, Moon, Database, CheckSquare, Bell, FileText } from 'lucide-react';
import { SectionType, ViewType } from '../types';
import { getTodayFormattedLong } from '../lib/dates';

interface HeaderProps {
  activeSection: SectionType;
  onChangeSection: (section: SectionType) => void;
  activeView: ViewType;
  pendingTasksCount: number;
  pendingRemindersCount: number;
  notesCount: number;
  isDark: boolean;
  onToggleDarkMode: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onChangeSection,
  activeView,
  pendingTasksCount,
  pendingRemindersCount,
  notesCount,
  isDark,
  onToggleDarkMode,
  onOpenBackup,
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
    summary = pendingRemindersCount === 0 ? 'Todo al día' : `${pendingRemindersCount} recordatorios pendientes`;
  } else if (activeSection === 'notas') {
    title = 'Notas';
    summary = `${notesCount} notas y apuntes`;
  }

  return (
    <header className="mb-2 select-none">
      {/* 1. Fila superior: Fecha completa a la izquierda + utilidades (Backup y Tema) a la derecha */}
      <div className="flex items-center justify-between gap-3 mb-1.5 sm:mb-2">
        <p className="text-calma-muted text-[13px] sm:text-[14px] m-0 capitalize tracking-wide font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {todayFormatted}
        </p>

        <div className="flex items-center gap-1 flex-none">
          {/* Copias de seguridad JSON */}
          <button
            onClick={onOpenBackup}
            title="Copias de seguridad (Importar/Exportar)"
            className="w-8 h-8 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-ink hover:bg-calma-surface transition-colors border border-transparent hover:border-calma-line"
            aria-label="Copia de seguridad"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Alternar modo oscuro */}
          <button
            onClick={onToggleDarkMode}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-ink hover:bg-calma-surface transition-colors border border-transparent hover:border-calma-line"
            aria-label="Cambiar tema"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Fila principal: Título Serif + Subtítulo a la izquierda, Selector de sección a la derecha */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif font-normal text-[36px] sm:text-[48px] md:text-[54px] leading-none tracking-[-0.01em] text-calma-ink m-0 select-none truncate">
            {title}
          </h1>
          <p className="text-calma-muted text-[13px] sm:text-[15px] mt-1.5 sm:mt-2 m-0 truncate">
            {summary}
          </p>
        </div>

        {/* Selector sutil de sección */}
        <div className="flex items-center bg-calma-surface rounded-full p-1 border border-calma-line shadow-xs flex-none">
          <button
            onClick={() => onChangeSection('tareas')}
            title="Tareas y Entregas"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              activeSection === 'tareas'
                ? 'bg-calma-accent text-white shadow-xs'
                : 'text-calma-muted hover:text-calma-ink'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangeSection('recordatorios')}
            title="Recordatorios"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              activeSection === 'recordatorios'
                ? 'bg-calma-accent text-white shadow-xs'
                : 'text-calma-muted hover:text-calma-ink'
            }`}
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangeSection('notas')}
            title="Notas & Anotaciones"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              activeSection === 'notas'
                ? 'bg-calma-accent text-white shadow-xs'
                : 'text-calma-muted hover:text-calma-ink'
            }`}
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
