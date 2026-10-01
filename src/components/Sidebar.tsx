import React from 'react';
import { SectionType } from '../types';
import {
  CheckSquare,
  Bell,
  FileText,
  Sun,
  Moon,
  Database,
} from 'lucide-react';

interface SidebarProps {
  activeSection: SectionType;
  onChangeSection: (section: SectionType) => void;
  isDark: boolean;
  onToggleDarkMode: () => void;
  onOpenBackup: () => void;
  counts: {
    pendingTasks: number;
    pendingReminders: number;
    notesCount: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onChangeSection,
  isDark,
  onToggleDarkMode,
  onOpenBackup,
  counts,
}) => {
  const sections: {
    id: SectionType;
    label: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      id: 'tareas',
      label: 'Tareas & Entregas',
      icon: <CheckSquare className="w-4 h-4" />,
      count: counts.pendingTasks,
    },
    {
      id: 'recordatorios',
      label: 'Recordatorios',
      icon: <Bell className="w-4 h-4" />,
      count: counts.pendingReminders,
    },
    {
      id: 'notas',
      label: 'Notas & Anotaciones',
      icon: <FileText className="w-4 h-4" />,
      count: counts.notesCount,
    },
  ];

  return (
    <>
      {/* Barra de navegación móvil (superior) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
              R
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">Rekayu</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenBackup}
              title="Copias de seguridad"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleDarkMode}
              title={isDark ? 'Tema claro' : 'Tema oscuro'}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Pestañas de sección en móvil */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
          {sections.map((s) => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onChangeSection(s.id)}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {s.icon}
                <span className="truncate">{s.label.split(' ')[0]}</span>
                {s.count > 0 && (
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold">
                    {s.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Barra lateral escritorio (Desktop Sidebar) */}
      <aside className="hidden lg:flex flex-col justify-between w-64 flex-shrink-0 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 select-none">
        <div>
          {/* Logo y título */}
          <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
              R
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                Rekayu
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Estudiante & Emprendimiento
              </p>
            </div>
          </div>

          {/* Menú de navegación */}
          <div className="space-y-1">
            <span className="block px-2.5 pb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Espacio de trabajo
            </span>
            {sections.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onChangeSection(s.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}>
                      {s.icon}
                    </span>
                    <span>{s.label}</span>
                  </div>
                  {s.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {s.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pie de la barra lateral */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          {/* Botón tema */}
          <button
            onClick={onToggleDarkMode}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase">
              {isDark ? 'Oscuro' : 'Claro'}
            </span>
          </button>

          {/* Botón copia de seguridad */}
          <button
            onClick={onOpenBackup}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4" />
              <span>Copias de seguridad</span>
            </div>
            <span className="text-[10px] text-slate-400">JSON</span>
          </button>
        </div>
      </aside>
    </>
  );
};
