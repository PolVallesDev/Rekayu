import React from 'react';
import { ViewType } from '../types';
import { Calendar, Clock, ListTodo, CheckCircle } from 'lucide-react';

interface ViewTabsProps {
  activeView: ViewType;
  onChangeView: (view: ViewType) => void;
  counts: {
    hoy: number;
    proximos: number;
    todas: number;
    hechas: number;
  };
}

export const ViewTabs: React.FC<ViewTabsProps> = ({
  activeView,
  onChangeView,
  counts,
}) => {
  const tabs: { id: ViewType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'hoy',
      label: 'Hoy',
      icon: <Clock className="w-3.5 h-3.5" />,
      count: counts.hoy,
    },
    {
      id: 'proximos',
      label: 'Próximos',
      icon: <Calendar className="w-3.5 h-3.5" />,
      count: counts.proximos,
    },
    {
      id: 'todas',
      label: 'Todas',
      icon: <ListTodo className="w-3.5 h-3.5" />,
      count: counts.todas,
    },
    {
      id: 'hechas',
      label: 'Hechas',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      count: counts.hechas,
    },
  ];

  return (
    <div className="grid grid-cols-4 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-3 text-xs select-none border border-slate-200/50 dark:border-slate-800/50">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeView(tab.id)}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              isActive
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                  : 'text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
