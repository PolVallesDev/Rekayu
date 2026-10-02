// Definición de tipos para Rekayu

export type Priority = 'baja' | 'media' | 'alta';

export type TaskStatus = 'pendiente' | 'hecha';

export interface Category {
  id: string;
  name: string;
  color: string; // Código hexadecimal ej. #3B82F6
  isDefault?: boolean;
}

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskLink {
  id: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // Formato YYYY-MM-DD
  time?: string; // Formato HH:mm ej. 18:00
  priority: Priority;
  categoryId: string;
  status: TaskStatus;
  subtasks?: Subtask[];
  links?: TaskLink[];
  isPinned?: boolean;
  createdAt: string; // ISO string
}

export type ViewType = 'hoy' | 'proximos' | 'todas' | 'hechas';

export type SectionType = 'tareas' | 'recordatorios' | 'notas';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  color?: string;
}

export interface Reminder {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string; // Formato YYYY-MM-DD
  dueTime?: string; // Formato HH:mm
  isCompleted: boolean;
  createdAt: string;
}

export interface AppData {
  version: number;
  tasks: Task[];
  categories: Category[];
  notes?: Note[];
  reminders?: Reminder[];
}
