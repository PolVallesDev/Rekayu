import React, { useMemo } from 'react';
import { Task, Category, ViewType, Priority } from '../types';
import { TaskCard } from './TaskCard';
import { isToday, isOverdue, getDaysRemaining, formatDateFriendly } from '../lib/dates';
import { Pin } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  activeView: ViewType;
  selectedCategoryId: string | null;
  selectedPriority?: Priority | null;
  selectedTaskId?: string | null;
  onSelectTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onOpenNewTask?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  categories,
  activeView,
  selectedCategoryId,
  selectedPriority = null,
  selectedTaskId,
  onSelectTask,
  onToggleTask,
  onTogglePin,
  onEditTask,
  onDeleteTask,
}) => {
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filtrado por categoría y prioridad
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedCategoryId && t.categoryId !== selectedCategoryId) return false;
      if (selectedPriority && t.priority !== selectedPriority) return false;
      return true;
    });
  }, [tasks, selectedCategoryId, selectedPriority]);

  // Render según vista activa
  if (activeView === 'hechas') {
    const doneTasks = filteredTasks.filter((t) => t.status === 'hecha');
    if (doneTasks.length === 0) {
      const isFiltered = !!(selectedCategoryId || selectedPriority);
      return (
        <div className="text-center py-14 px-4 select-none">
          <b className="font-serif font-normal text-[30px] sm:text-[34px] text-calma-ink block mb-1">
            {isFiltered ? 'Sin tareas coincidentes' : 'Aún no hay nada'}
          </b>
          <p className="text-calma-muted text-[15px] m-0">
            {isFiltered
              ? 'No hay tareas completadas con los filtros seleccionados.'
              : 'Las tareas que completes aparecerán aquí.'}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-1 px-1 py-1">
        {doneTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            category={categoryMap.get(task.categoryId)}
            isSelected={selectedTaskId === task.id}
            onSelect={onSelectTask}
            onToggle={onToggleTask}
            onTogglePin={onTogglePin}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    );
  }

  if (activeView === 'proximos') {
    // Tareas futuras pendientes
    const pendingFuture = filteredTasks.filter(
      (t) => t.status === 'pendiente' && t.dueDate && !isToday(t.dueDate) && !isOverdue(t.dueDate)
    );

    if (pendingFuture.length === 0) {
      const isFiltered = !!(selectedCategoryId || selectedPriority);
      return (
        <div className="text-center py-14 px-4 select-none">
          <b className="font-serif font-normal text-[30px] sm:text-[34px] text-calma-ink block mb-1">
            {isFiltered ? 'Sin tareas coincidentes' : 'Nada a la vista'}
          </b>
          <p className="text-calma-muted text-[15px] m-0">
            {isFiltered
              ? 'No hay tareas programadas con los filtros seleccionados.'
              : 'No tienes tareas pendientes próximas programadas.'}
          </p>
        </div>
      );
    }

    // Agrupar por fecha
    const groups: { label: string; tasks: Task[] }[] = [];
    const sorted = [...pendingFuture].sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1));

    sorted.forEach((t) => {
      const days = getDaysRemaining(t.dueDate!);
      let groupLabel = formatDateFriendly(t.dueDate!);
      if (days === 1) groupLabel = 'Mañana';

      let existing = groups.find((g) => g.label === groupLabel);
      if (!existing) {
        existing = { label: groupLabel, tasks: [] };
        groups.push(existing);
      }
      existing.tasks.push(t);
    });

    return (
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-calma-muted text-[14px] font-medium mb-1.5 px-0.5">
              {group.label}
            </p>
            <div className="space-y-1 px-1 py-1">
              {group.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={categoryMap.get(task.categoryId)}
                  isSelected={selectedTaskId === task.id}
                  onSelect={onSelectTask}
                  onToggle={onToggleTask}
                  onTogglePin={onTogglePin}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vista 'hoy' (por defecto) o 'todas'
  const pendingTasks = filteredTasks.filter((t) => {
    if (t.status !== 'pendiente') return false;
    if (activeView === 'todas') return true;
    if (!t.dueDate) return true;
    return isToday(t.dueDate) || isOverdue(t.dueDate);
  });

  // Tareas fijadas para pantallas medianas/móvil
  const pinnedTasks = activeView === 'hoy' ? pendingTasks.filter((t) => t.isPinned) : [];
  const otherTasks = activeView === 'hoy' ? pendingTasks.filter((t) => !t.isPinned) : pendingTasks;

  if (pendingTasks.length === 0) {
    const isFiltered = !!(selectedCategoryId || selectedPriority);
    return (
      <div className="text-center py-14 px-4 select-none">
        <b className="font-serif font-normal text-[30px] sm:text-[34px] text-calma-ink block mb-1">
          {isFiltered ? 'Sin tareas coincidentes' : 'Todo al día'}
        </b>
        <p className="text-calma-muted text-[15px] m-0">
          {isFiltered
            ? 'No hay tareas pendientes con los filtros seleccionados.'
            : 'Disfruta del resto del día.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sección destacada de fijadas en móvil / tablet */}
      {pinnedTasks.length > 0 && (
        <div className="xl:hidden bg-calma-surface/60 rounded-2xl p-2.5 border border-calma-line/60">
          <div className="flex items-center gap-1.5 px-2 py-1 text-calma-accent text-[12px] font-semibold uppercase tracking-wider mb-1">
            <Pin className="w-3.5 h-3.5" />
            <span>Fijadas ({pinnedTasks.length})</span>
          </div>
          <div className="space-y-1 px-1 py-1">
            {pinnedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                category={categoryMap.get(task.categoryId)}
                isSelected={selectedTaskId === task.id}
                onSelect={onSelectTask}
                onToggle={onToggleTask}
                onTogglePin={onTogglePin}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lista normal de tareas */}
      <div className="space-y-1 px-1 py-1">
        {otherTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            category={categoryMap.get(task.categoryId)}
            isSelected={selectedTaskId === task.id}
            onSelect={onSelectTask}
            onToggle={onToggleTask}
            onTogglePin={onTogglePin}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
};
