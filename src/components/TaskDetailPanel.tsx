import React, { useEffect } from 'react';
import { Task, Category } from '../types';
import { formatDateFriendly, getDaysRemaining, getUrgencyLevel } from '../lib/dates';
import {
  X,
  Calendar,
  Flag,
  Tag,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Circle,
  CalendarDays,
} from 'lucide-react';

interface TaskDetailPanelProps {
  task: Task | null;
  category?: Category;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  category,
  onClose,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  // Cerrar al pulsar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!task) return null;

  const isDone = task.status === 'hecha';
  const daysRemaining = task.dueDate ? getDaysRemaining(task.dueDate) : null;
  const urgency = task.dueDate ? getUrgencyLevel(task.dueDate) : null;

  const getUrgencyBadge = () => {
    if (daysRemaining === null) return null;
    let label = `${daysRemaining} días`;
    if (daysRemaining < 0) label = `Venció hace ${Math.abs(daysRemaining)}d`;
    else if (daysRemaining === 0) label = 'Vence hoy';
    else if (daysRemaining === 1) label = 'Mañana';

    let colorClasses = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (urgency === 'vencido' || urgency === 'urgente') {
      colorClasses = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    } else if (urgency === 'proximo') {
      colorClasses = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colorClasses}`}>
        <Clock className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'alta':
        return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'media':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'baja':
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop con desenfoque suave para cerrar al hacer clic fuera */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer deslizante moderno (Slide-over) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
          
          {/* Header Superior */}
          <div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              {/* Etiqueta de categoría en el encabezado */}
              <div className="flex items-center gap-2">
                {category ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                    style={{
                      backgroundColor: `${category.color}15`,
                      borderColor: `${category.color}35`,
                      color: category.color,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Tarea</span>
                )}
              </div>

              {/* Botones de acción rápida */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(task)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Editar tarea"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar definitivamente "${task.title}"?`)) {
                      onDelete(task.id);
                      onClose();
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Eliminar tarea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-slate-200 dark:border-slate-800 mx-1" />
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Cerrar panel (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido principal con scroll */}
            <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
              
              {/* Título de la tarea con checkbox elegante */}
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => onToggleStatus(task.id)}
                  className={`flex-shrink-0 w-6 h-6 mt-1 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                  }`}
                  title={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-transparent hover:text-slate-400" />
                  )}
                </button>

                <div className="flex-1">
                  <h1
                    className={`text-xl font-bold leading-snug tracking-tight ${
                      isDone
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h1>
                </div>
              </div>

              {/* Inspector de propiedades (Estilo Notion/Linear) */}
              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                
                {/* Estado */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Estado
                  </span>
                  <button
                    onClick={() => onToggleStatus(task.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold border transition-colors ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200/60 dark:bg-slate-700/60 border-transparent text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isDone ? 'Completada' : 'Pendiente'}
                  </button>
                </div>

                {/* Prioridad */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-medium">
                    <Flag className="w-3.5 h-3.5" />
                    Prioridad
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold capitalize border ${getPriorityStyle()}`}
                  >
                    {task.priority}
                  </span>
                </div>

                {/* Fecha límite */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Fecha límite
                  </span>
                  {task.dueDate ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {formatDateFriendly(task.dueDate)}
                      </span>
                      {getUrgencyBadge()}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Sin fecha</span>
                  )}
                </div>

                {/* Categoría */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    Categoría
                  </span>
                  {category ? (
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {category.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">General</span>
                  )}
                </div>

                {/* Creada el */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700/40 text-[11px]">
                  <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Creada
                  </span>
                  <span className="text-slate-500">
                    {new Date(task.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Descripción / Notas */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Notas y Detalles
                </h3>
                {task.description ? (
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-normal">
                    {task.description}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No hay detalles ni notas para esta tarea. Puedes pulsar en "Editar tarea" para añadir enlaces, pasos o apuntes.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer del Drawer */}
          <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
            <button
              onClick={() => onToggleStatus(task.id)}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                isDone
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {isDone ? 'Volver a marcar como pendiente' : 'Marcar como completada'}
            </button>

            <button
              onClick={() => onEdit(task)}
              className="py-2 px-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Editar
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
