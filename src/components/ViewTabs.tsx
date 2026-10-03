import React from 'react';
import { ViewType } from '../types';

interface ViewTabsProps {
  activeView: ViewType;
  onChangeView: (view: ViewType) => void;
  counts?: {
    hoy: number;
    proximos: number;
    todas: number;
    hechas: number;
  };
}

export const ViewTabs: React.FC<ViewTabsProps> = ({
  activeView,
  onChangeView,
}) => {
  const tabs: { id: ViewType; label: string }[] = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'proximos', label: 'Próximos' },
    { id: 'hechas', label: 'Hechas' },
  ];

  return (
    <nav className="flex gap-6 sm:gap-7 mt-8 mb-5 border-b border-calma-line select-none" role="tablist" aria-label="Vistas">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChangeView(tab.id)}
            className={`pb-3 text-[15px] font-medium transition-colors border-b-2 -mb-[1px] cursor-pointer touch-manipulation ${
              isActive
                ? 'text-calma-ink border-calma-accent font-semibold'
                : 'text-calma-muted border-transparent hover:text-calma-ink'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};
