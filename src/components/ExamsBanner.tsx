import React from 'react';
import { Task, Category } from '../types';
import { getDaysRemaining, getUrgencyLevel } from '../lib/dates';
import { GraduationCap, Clock, Check } from 'lucide-react';

interface ExamsBannerProps {
  tasks: Task[];
  categories: Category[];
  selectedTaskId?: string | null;
  onSelectTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
}

export const ExamsBanner: React.FC<ExamsBannerProps> = ({
  tasks,
  categories,
  selectedTaskId,
  onSelectTask,
  onToggleTask,
}) => {
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

  const upcomingExams = tasks
    .filter(
      (task) =>
        task.status === 'pendiente' &&
        task.dueDate &&
        examCategoryIds.has(task.categoryId)
    )
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1));

  if (upcomingExams.length === 0) {
    return null;
  }

  const getUrgencyBadge = (dueDate: string) => {
    const level = getUrgencyLevel(dueDate);
    switch (level) {
      case 'vencido':
      case 'urgente':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900';
      case 'proximo':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900';
      case 'tranquilo':
      default:
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900';
    }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Exámenes y Entregas Próximas
          </h2>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {upcomingExams.length}
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1.5 -mx-4 px-4 sm:mx-0 sm:px-0">
        {upcomingExams.map((exam) => {
          const days = getDaysRemaining(exam.dueDate!);
          const isSelected = selectedTaskId === exam.id;

          let label = `${days} días`;
          if (days === 0) label = 'Hoy';
          else if (days === 1) label = 'Mañana';
          else if (days < 0) label = `Venció (${Math.abs(days)}d)`;

          return (
            <div
              key={exam.id}
              onClick={() => onSelectTask(exam)}
              className={`flex-shrink-0 w-64 p-3 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900 flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getUrgencyBadge(
                      exam.dueDate!
                    )}`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    {label}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(exam.id);
                    }}
                    title="Marcar como hecha"
                    className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>

                <h3 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {exam.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{exam.dueDate}</span>
                <span className="capitalize">{exam.priority}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
