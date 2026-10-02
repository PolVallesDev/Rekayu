import React from 'react';
import { Task, Category } from '../types';
import { getDaysRemaining, formatDateLongSpanish } from '../lib/dates';

interface ExamsBannerProps {
  tasks: Task[];
  categories: Category[];
  selectedTaskId?: string | null;
  onSelectTask: (task: Task) => void;
  onToggleTask?: (id: string) => void;
}

export const ExamsBanner: React.FC<ExamsBannerProps> = ({
  tasks,
  categories,
  selectedTaskId,
  onSelectTask,
}) => {
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const examCategoryIds = new Set(
    categories
      .filter(
        (c) =>
          c.id === 'cat-examenes' ||
          c.name.toLowerCase().includes('examen') ||
          c.name.toLowerCase().includes('entrega')
      )
      .map((c) => c.id)
  );

  const upcomingKeyTasks = tasks
    .filter(
      (task) =>
        task.status === 'pendiente' &&
        task.dueDate &&
        (examCategoryIds.has(task.categoryId) || task.priority === 'alta')
    )
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
    .slice(0, 3); // Mostrar las más próximas destacadas

  if (upcomingKeyTasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-calma-surface rounded-[20px] px-5 py-1 mb-7 shadow-calma border border-calma-line/50 transition-colors">
      {upcomingKeyTasks.map((task, idx) => {
        const cat = categoryMap.get(task.categoryId);
        const days = getDaysRemaining(task.dueDate!);
        const isSoon = days <= 3;
        const isSelected = selectedTaskId === task.id;

        return (
          <div
            key={task.id}
            onClick={() => onSelectTask(task)}
            className={`flex items-center gap-3.5 py-4 cursor-pointer transition-colors ${
              idx > 0 ? 'border-t border-calma-line' : ''
            } ${isSelected ? 'opacity-85' : 'hover:opacity-90'}`}
          >
            {/* Punto indicador de categoría */}
            <span
              className="w-2 h-2 rounded-full flex-none"
              style={{ backgroundColor: cat?.color || 'var(--muted)' }}
            />

            {/* Título y fecha */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-calma-ink truncate text-[15px] m-0">
                {task.title}
              </p>
              <p className="text-calma-muted text-[13.5px] truncate m-0 mt-0.5">
                {formatDateLongSpanish(task.dueDate!)}
              </p>
            </div>

            {/* Contador de días en Instrument Serif */}
            <div className={`text-right leading-none flex-none pl-3 ${isSoon ? 'text-calma-warn' : 'text-calma-ink'}`}>
              <b className="font-serif font-normal text-[32px] sm:text-[34px] block">
                {days <= 0 ? 'Hoy' : days}
              </b>
              <span className="text-[12px] text-calma-muted block mt-0.5">
                {days <= 0 ? '' : days === 1 ? 'día' : 'días'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
