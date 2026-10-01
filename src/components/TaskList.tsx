import React, { useMemo } from 'react';
import { Task, Category, ViewType } from '../types';
import { TaskCard } from './TaskCard';
import { isOverdue, isToday, getDaysRemaining, formatDateFriendly } from '../lib/dates';
import { CheckCircle2, CalendarDays, Inbox, AlertTriangle } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  activeView: ViewType;
  selectedCategoryId: string | null;
  selectedTaskId?: string | null;
  onSelectTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTask: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  categories,
  activeView,
  selectedCategoryId,
  selectedTaskId,
  onSelectTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onOpenNewTask,
}) => {
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const categoryFilteredTasks = useMemo(() => {
    if (!selectedCategoryId) return tasks;
    return tasks.filter((t) => t.categoryId === selectedCategoryId);
  }, [tasks, selectedCategoryId]);

  const renderedContent = useMemo(() => {
    if (activeView === 'hechas') {
      const doneTasks = categoryFilteredTasks.filter((t) => t.status === 'hecha');
      if (doneTasks.length === 0) {
        return (
          <EmptyState
            title="Sin tareas completadas aún"
            description="Las tareas que marques como hechas aparecerán aquí."
            icon={<CheckCircle2 className="w-8 h-8 text-slate-400" />}
          />
        );
      }
      return (
        <div className="space-y-2">
          {doneTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              category={categoryMap.get(t.categoryId)}
              isSelected={selectedTaskId === t.id}
              onSelect={onSelectTask}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      );
    }

    if (activeView === 'hoy') {
      const pending = categoryFilteredTasks.filter((t) => t.status === 'pendiente');
      const overdueTasks = pending.filter((t) => t.dueDate && isOverdue(t.dueDate));
      const todayTasks = pending.filter((t) => t.dueDate && isToday(t.dueDate));

      if (overdueTasks.length === 0 && todayTasks.length === 0) {
        return (
          <EmptyState
            title="Al día por hoy"
            description="No tienes tareas pendientes para hoy ni vencidas."
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
            actionLabel="Añadir tarea para hoy"
            onAction={onOpenNewTask}
          />
        );
      }

      return (
        <div className="space-y-4">
          {/* Tareas vencidas */}
          {overdueTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Vencidas ({overdueTasks.length})</span>
              </div>
              {overdueTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  category={categoryMap.get(t.categoryId)}
                  isSelected={selectedTaskId === t.id}
                  onSelect={onSelectTask}
                  onToggle={onToggleTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}

          {/* Tareas para hoy */}
          {todayTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                <span>Para hoy ({todayTasks.length})</span>
              </div>
              {todayTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  category={categoryMap.get(t.categoryId)}
                  isSelected={selectedTaskId === t.id}
                  onSelect={onSelectTask}
                  onToggle={onToggleTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeView === 'proximos') {
      const pendingUpcoming = categoryFilteredTasks.filter(
        (t) => t.status === 'pendiente' && t.dueDate && getDaysRemaining(t.dueDate) > 0
      );

      if (pendingUpcoming.length === 0) {
        return (
          <EmptyState
            title="Sin tareas programadas"
            description="Agrega tareas con fecha límite en los próximos días para verlas organizadas aquí."
            icon={<CalendarDays className="w-8 h-8 text-slate-400" />}
            actionLabel="Programar tarea"
            onAction={onOpenNewTask}
          />
        );
      }

      const groupsMap = new Map<string, Task[]>();
      pendingUpcoming
        .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
        .forEach((task) => {
          const dateKey = task.dueDate!;
          if (!groupsMap.has(dateKey)) {
            groupsMap.set(dateKey, []);
          }
          groupsMap.get(dateKey)!.push(task);
        });

      return (
        <div className="space-y-5">
          {Array.from(groupsMap.entries()).map(([dateKey, groupTasks]) => (
            <div key={dateKey} className="space-y-2">
              <div className="flex items-center justify-between px-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                  {formatDateFriendly(dateKey)}
                </span>
                <span className="text-slate-400 text-[11px]">{dateKey}</span>
              </div>
              {groupTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  category={categoryMap.get(t.categoryId)}
                  isSelected={selectedTaskId === t.id}
                  onSelect={onSelectTask}
                  onToggle={onToggleTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    // Vista "Todas"
    const allPending = categoryFilteredTasks.filter((t) => t.status === 'pendiente');
    const allDone = categoryFilteredTasks.filter((t) => t.status === 'hecha');

    if (categoryFilteredTasks.length === 0) {
      return (
        <EmptyState
          title="No hay tareas"
          description="Crea tu primera tarea para organizar tus prioridades."
          icon={<Inbox className="w-8 h-8 text-slate-400" />}
          actionLabel="Crear tarea"
          onAction={onOpenNewTask}
        />
      );
    }

    return (
      <div className="space-y-4">
        {allPending.length > 0 && (
          <div className="space-y-2">
            <div className="px-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pendientes ({allPending.length})
            </div>
            {allPending.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                category={categoryMap.get(t.categoryId)}
                isSelected={selectedTaskId === t.id}
                onSelect={onSelectTask}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}

        {allDone.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="px-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Completadas ({allDone.length})
            </div>
            {allDone.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                category={categoryMap.get(t.categoryId)}
                isSelected={selectedTaskId === t.id}
                onSelect={onSelectTask}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    );
  }, [
    activeView,
    categoryFilteredTasks,
    categoryMap,
    selectedTaskId,
    onSelectTask,
    onToggleTask,
    onEditTask,
    onDeleteTask,
    onOpenNewTask,
  ]);

  return <div className="pb-16">{renderedContent}</div>;
};

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => (
  <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 my-3">
    <div className="flex justify-center mb-2">{icon}</div>
    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-3 px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-lg text-xs font-semibold transition-all"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
