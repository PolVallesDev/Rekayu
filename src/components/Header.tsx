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
    <header className="flex items-start justify-between gap-4 mb-2">
      <div>
        <p className="text-calma-muted text-[15px] m-0 mb-0.5 capitalize">
          {todayFormatted}
        </p>
        <h1 className="font-serif font-normal text-[52px] sm:text-[60px] leading-none tracking-[-0.01em] text-calma-ink m-0 select-none">
          {title}
        </h1>
        <p className="text-calma-muted text-[15px] mt-2.5 m-0">
          {summary}
        </p>
      </div>

      {/* Controles de navegación y utilidades en diseño sobrio */}
      <div className="flex items-center gap-1.5 flex-none pt-1">
        {/* Selector sutil de sección */}
        <div className="flex items-center bg-calma-surface rounded-full p-1 border border-calma-line shadow-xs">
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

        {/* Copias de seguridad JSON */}
        <button
          onClick={onOpenBackup}
          title="Copias de seguridad (Importar/Exportar)"
          className="w-10 h-10 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-ink hover:bg-calma-surface transition-colors border border-transparent hover:border-calma-line"
          aria-label="Copia de seguridad"
        >
          <Database className="w-4.5 h-4.5" />
        </button>

        {/* Alternar modo oscuro */}
        <button
          onClick={onToggleDarkMode}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="w-10 h-10 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-ink hover:bg-calma-surface transition-colors border border-transparent hover:border-calma-line"
          aria-label="Cambiar tema"
        >
          {isDark ? (
            <Sun className="w-4.5 h-4.5 text-amber-300" />
          ) : (
            <Moon className="w-4.5 h-4.5" />
          )}
        </button>
      </div>
    </header>
  );
};
