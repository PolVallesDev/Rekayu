import React from 'react';
import { Task, Category, Priority } from '../types';
import { formatDateFriendly, isOverdue, isToday } from '../lib/dates';
import { Check, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  category?: Category;
  isSelected?: boolean;
  onSelect: (task: Task) => void;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  isSelected,
  onSelect,
  onToggle,
}) => {
  const isDone = task.status === 'hecha';
  const taskOverdue = !isDone && isOverdue(task.dueDate);
  const taskIsToday = !isDone && isToday(task.dueDate);

  // Prioridades en diseño sobrio
  const getPriorityDot = (priority: Priority) => {
    switch (priority) {
      case 'alta':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900';
      case 'media':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900';
      case 'baja':
      default:
        return 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div
      onClick={() => onSelect(task)}
      className={`group relative p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 shadow-sm'
          : isDone
          ? 'bg-slate-50/50 border-slate-200/80 dark:bg-slate-900/30 dark:border-slate-800/60 opacity-60'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox minimalista (detiene la propagación para no reabrir/deseleccionar) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-all ${
            isDone
              ? 'bg-slate-700 border-slate-700 text-white dark:bg-slate-300 dark:border-slate-300 dark:text-slate-900'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400'
          }`}
          aria-label={isDone ? 'Desmarcar tarea' : 'Completar tarea'}
        >
          {isDone && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </button>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`text-sm font-medium leading-snug truncate ${
                isDone
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Prioridad sobria */}
            <span
              className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getPriorityDot(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          {/* Descripción corta */}
          {task.description && (
            <p
              className={`text-xs mt-0.5 truncate ${
                isDone
                  ? 'line-through text-slate-400 dark:text-slate-600'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Metadatos (Categoría y Fecha) */}
          <div className="flex items-center gap-2 mt-2 text-[11px]">
            {category && (
              <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            )}

            {task.dueDate && (
              <span
                className={`flex items-center gap-1 font-medium ${
                  taskOverdue
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : taskIsToday
                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {formatDateFriendly(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
