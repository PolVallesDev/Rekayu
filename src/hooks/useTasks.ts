import { useState, useCallback } from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { getTasks, saveTasks } from '../lib/storage';

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  categoryId: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());

  // Añadir una nueva tarea
  const addTask = useCallback((input: CreateTaskInput): Task => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      dueDate: input.dueDate || undefined,
      priority: input.priority,
      categoryId: input.categoryId,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    setTasks(updated);
    return newTask;
  }, [tasks]);

  // Modificar una tarea existente
  const updateTask = useCallback((updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    saveTasks(updated);
    setTasks(updated);
  }, [tasks]);

  // Alternar entre pendiente y hecha
  const toggleTaskStatus = useCallback((id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextStatus: TaskStatus = t.status === 'pendiente' ? 'hecha' : 'pendiente';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    saveTasks(updated);
    setTasks(updated);
  }, [tasks]);

  // Eliminar una tarea
  const deleteTask = useCallback((id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    setTasks(updated);
  }, [tasks]);

  // Recargar tareas desde el almacenamiento (ej. tras importar JSON)
  const refreshTasks = useCallback(() => {
    setTasks(getTasks());
  }, []);

  return {
    tasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    refreshTasks,
  };
};
