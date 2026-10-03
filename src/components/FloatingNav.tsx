import React from 'react';
import { CheckSquare, Calendar, Bell, FileText, Settings } from 'lucide-react';
import { NavSection } from '../types';

interface FloatingNavProps {
  activeSection: NavSection;
  onChangeSection: (section: NavSection) => void;
  isPanelOpen: boolean;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeSection,
  onChangeSection,
  isPanelOpen,
}) => {
  const contentItems: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tareas', label: 'Tareas', icon: CheckSquare },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'recordatorios', label: 'Recordatorios', icon: Bell },
    { id: 'notas', label: 'Notas', icon: FileText },
  ];

  return (
    <nav
      className={`fixed z-45 bg-calma-surface/90 backdrop-blur-md border border-calma-line shadow-md transition-all duration-350 ease-[cubic-bezier(0.2,0.7,0.2,1)] select-none ${
        isPanelOpen
          ? 'hidden lg:flex lg:flex-col lg:top-6 lg:right-[496px] lg:left-auto lg:translate-x-0 rounded-2xl p-2 gap-2 shadow-lg'
          : 'top-2.5 sm:top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 flex flex-row rounded-full p-1.5 gap-1 sm:gap-1.5'
      }`}
      aria-label="Navegación principal"
    >
      {/* 4 secciones de contenido productivo */}
      <div className={`flex ${isPanelOpen ? 'flex-col gap-2' : 'flex-row gap-1 sm:gap-1.5'}`}>
        {contentItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeSection(item.id)}
              title={item.label}
              aria-label={item.label}
              className={`flex items-center justify-center transition-all duration-200 ${
                isPanelOpen
                  ? 'w-10 h-10 rounded-xl'
                  : 'w-9 h-9 sm:w-10 sm:h-10 rounded-full'
              } ${
                isActive
                  ? 'bg-calma-accent text-white shadow-xs scale-105'
                  : 'text-calma-muted hover:text-calma-ink hover:bg-calma-bg/80'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </button>
          );
        })}
      </div>

      {/* Separador sutil Calma */}
      <div
        className={`${
          isPanelOpen ? 'w-5 h-[1px] my-0.5' : 'w-[1px] h-5 mx-0.5'
        } bg-calma-line flex-none self-center`}
      />

      {/* Ajustes */}
      <button
        onClick={() => onChangeSection('ajustes')}
        title="Ajustes"
        aria-label="Ajustes"
        className={`flex items-center justify-center transition-all duration-200 ${
          isPanelOpen
            ? 'w-10 h-10 rounded-xl'
            : 'w-9 h-9 sm:w-10 sm:h-10 rounded-full'
        } ${
          activeSection === 'ajustes'
            ? 'bg-calma-accent text-white shadow-xs scale-105'
            : 'text-calma-muted hover:text-calma-ink hover:bg-calma-bg/80'
        }`}
      >
        <Settings className="w-5 h-5 stroke-[2.2]" />
      </button>
    </nav>
  );
};
