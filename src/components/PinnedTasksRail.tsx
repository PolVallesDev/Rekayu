import React from 'react';
import { Task, Category } from '../types';
import { Pin, Check, X } from 'lucide-react';

interface PinnedTasksRailProps {
  tasks: Task[];
  categories: Category[];
  selectedTaskId?: string | null;
  onSelectTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const PinnedTasksRail: React.FC<PinnedTasksRailProps> = ({
  tasks,
  categories,
  selectedTaskId,
  onSelectTask,
  onToggleTask,
  onTogglePin,
}) => {
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const pinnedTasks = tasks.filter((t) => t.isPinned && t.status === 'pendiente');

  if (pinnedTasks.length === 0) {
    return null;
  }

  return (
    <aside
      className="hidden xl:flex fixed left-6 top-8 w-60 max-h-[calc(100vh-120px)] flex-col z-10 bg-calma-surface rounded-2xl p-3.5 border border-calma-line shadow-calma transition-all"
      aria-label="Tareas fijadas"
    >
      {/* Cabecera del panel de fijadas */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-calma-line">
        <div className="flex items-center gap-1.5 text-calma-accent text-[12px] font-medium uppercase tracking-wider">
          <Pin className="w-3.5 h-3.5" />
          <span>Fijadas</span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-calma-accent-soft text-calma-accent font-medium">
          {pinnedTasks.length}
        </span>
      </div>

      {/* Lista scrolleable de tareas fijadas */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
        {pinnedTasks.map((task) => {
          const cat = categoryMap.get(task.categoryId);
          const isSelected = selectedTaskId === task.id;

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className={`group flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'bg-calma-bg text-calma-ink font-medium shadow-xs'
                  : 'hover:bg-calma-bg/60 text-calma-ink'
              }`}
            >
              {/* Checkbox circular */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTask(task.id);
                }}
                className="w-4.5 h-4.5 rounded-full border border-calma-muted/70 hover:border-calma-accent flex items-center justify-center flex-none transition-colors"
                aria-label="Marcar como hecha"
              >
                <Check className="w-2.5 h-2.5 stroke-[3] text-transparent" />
              </button>

              {/* Título y categoría */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-tight truncate m-0">
                  {task.title}
                </p>
                {cat && (
                  <div className="flex items-center gap-1 text-[11px] text-calma-muted mt-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-none"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>
                )}
              </div>

              {/* Botón para desfijar */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(task.id);
                }}
                className="w-5 h-5 rounded-md flex items-center justify-center text-calma-muted opacity-0 group-hover:opacity-100 hover:text-calma-ink transition-opacity flex-none"
                title="Desfijar de la barra lateral"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
