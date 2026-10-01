import React from 'react';
import { Sun, Moon, Database, CheckSquare } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleDarkMode,
  onOpenBackup,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">
              Rekayu
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Estudio & Emprendimiento
            </p>
          </div>
        </div>

        {/* Acciones de cabecera */}
        <div className="flex items-center gap-1.5">
          {/* Botón Backup JSON */}
          <button
            onClick={onOpenBackup}
            title="Importar / Exportar datos"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Abrir panel de copia de seguridad"
          >
            <Database className="w-5 h-5" />
          </button>

          {/* Botón Modo Oscuro */}
          <button
            onClick={onToggleDarkMode}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Alternar modo oscuro"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
