import { useEffect } from 'react';
import { NavSection, ViewType, Task, Reminder } from '../types';
import { isOverdue, isToday } from '../lib/dates';

interface DocumentTitleParams {
  activeNav: NavSection;
  activeView: ViewType;
  selectedTask: Task | null;
  selectedReminder: Reminder | null;
  tasks: Task[];
  reminders: Reminder[];
}

const truncate = (text: string, maxLength = 30): string => {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
};

/**
 * Hook para mantener el título de la pestaña del navegador sincronizado dinámicamente:
 * "Rekayu - [Página actual] · [Tarea o recordatorio importante]"
 */
export const useDocumentTitle = ({
  activeNav,
  activeView,
  selectedTask,
  selectedReminder,
  tasks,
  reminders,
}: DocumentTitleParams) => {
  useEffect(() => {
    // 1. Si hay una tarea o recordatorio abierto en el panel lateral, mostrar su título directamente
    if (selectedTask) {
      document.title = `Rekayu - ${truncate(selectedTask.title, 35)}`;
      return;
    }

    if (selectedReminder) {
      document.title = `Rekayu - ${truncate(selectedReminder.title, 35)}`;
      return;
    }

    // 2. Páginas fijas: Calendario, Notas o Ajustes
    if (activeNav === 'calendario') {
      document.title = 'Rekayu - Calendario';
      return;
    }

    if (activeNav === 'notas') {
      document.title = 'Rekayu - Notas';
      return;
    }

    if (activeNav === 'ajustes') {
      document.title = 'Rekayu - Ajustes';
      return;
    }

    // 3. Sección: Recordatorios
    if (activeNav === 'recordatorios') {
      const pendingReminders = reminders.filter((r) => !r.isCompleted);
      const importantReminder =
        pendingReminders.find((r) => r.dueDate || r.dueTime) || pendingReminders[0];

      if (importantReminder) {
        document.title = `Rekayu - Recordatorios · ${truncate(importantReminder.title, 26)}`;
      } else {
        document.title = 'Rekayu - Recordatorios';
      }
      return;
    }

    // 4. Sección: Tareas (Hoy, Próximos, Hechas)
    if (activeNav === 'tareas') {
      const viewNames: Record<ViewType, string> = {
        hoy: 'Hoy',
        proximos: 'Próximos',
        todas: 'Todas',
        hechas: 'Hechas',
      };
      const viewName = viewNames[activeView] || 'Tareas';

      if (activeView === 'hechas') {
        document.title = 'Rekayu - Hechas';
        return;
      }

      const pendingTasks = tasks.filter((t) => t.status === 'pendiente');
      let importantTask: Task | undefined;

      if (activeView === 'hoy') {
        const todayTasks = pendingTasks.filter(
          (t) => !t.dueDate || isToday(t.dueDate) || isOverdue(t.dueDate)
        );
        importantTask =
          todayTasks.find((t) => t.isPinned) ||
          todayTasks.find((t) => t.priority === 'alta') ||
          todayTasks[0];
      } else if (activeView === 'proximos') {
        const nextTasks = pendingTasks.filter(
          (t) => t.dueDate && !isToday(t.dueDate) && !isOverdue(t.dueDate)
        );
        importantTask =
          nextTasks.find((t) => t.isPinned) ||
          nextTasks.find((t) => t.priority === 'alta') ||
          nextTasks[0];
      } else {
        importantTask =
          pendingTasks.find((t) => t.isPinned) ||
          pendingTasks.find((t) => t.priority === 'alta') ||
          pendingTasks[0];
      }

      if (importantTask) {
        document.title = `Rekayu - ${viewName} · ${truncate(importantTask.title, 26)}`;
      } else {
        document.title = `Rekayu - ${viewName}`;
      }
    }
  }, [activeNav, activeView, selectedTask, selectedReminder, tasks, reminders]);
};
