import React from 'react';
import { Task, Category } from '../types';
import { Check, Link as LinkIcon, Pin } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  category?: Category;
  isSelected?: boolean;
  onSelect: (task: Task) => void;
  onToggle: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  isSelected,
  onSelect,
  onToggle,
  onTogglePin,
}) => {
  const isDone = task.status === 'hecha';

  // Subtareas completadas vs totales
  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.done).length || 0;
  const hasLinks = (task.links?.length || 0) > 0;

  return (
    <div
      onClick={() => onSelect(task)}
      className={`group relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-150 select-none border ${
        isSelected
          ? 'bg-calma-surface rounded-2xl shadow-calma border-calma-line/80'
          : isDone
          ? 'opacity-70 hover:bg-calma-surface/50 border-transparent'
          : 'hover:bg-calma-surface/60 border-transparent'
      }`}
    >
      {/* Botón Checkbox circular */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`flex-none w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
          isDone
            ? 'bg-calma-accent border-calma-accent text-white'
            : 'border-calma-muted/70 hover:border-calma-accent text-transparent'
        }`}
        aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como hecha'}
      >
        <Check className={`w-3.5 h-3.5 stroke-[2.8] ${isDone ? 'opacity-100' : 'opacity-0'}`} />
      </button>

      {/* Cuerpo de la tarea */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[15.5px] leading-snug font-normal truncate m-0 ${
            isDone ? 'line-through text-calma-muted' : 'text-calma-ink'
          }`}
        >
          {task.title}
        </p>

        {/* Metadatos */}
        <div className="flex items-center gap-2 text-calma-muted text-[13.5px] mt-0.5">
          {category && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-none"
                style={{ backgroundColor: category.color }}
              />
              <span>{category.name}</span>
            </span>
          )}

          {subtasksCount > 0 && (
            <span className="inline-flex items-center text-xs ml-1 text-calma-muted/90 font-medium">
              {completedSubtasks}/{subtasksCount}
            </span>
          )}

          {hasLinks && (
            <span className="inline-flex items-center ml-1 text-calma-muted/80" title="Contiene enlaces">
              <LinkIcon className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* Hora opcional */}
      {task.time && (
        <span className="text-calma-muted text-[13.5px] font-normal flex-none">
          {task.time}
        </span>
      )}

      {/* Botón para fijar / pinear tarea */}
      {onTogglePin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(task.id);
          }}
          className={`p-1.5 rounded-lg transition-all flex-none ${
            task.isPinned
              ? 'text-calma-accent opacity-100 bg-calma-accent-soft'
              : 'text-calma-muted opacity-0 group-hover:opacity-100 hover:text-calma-ink hover:bg-calma-surface'
          }`}
          title={task.isPinned ? 'Desfijar tarea' : 'Fijar tarea'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Separador plano inferior (sin curvas extrañas), que desaparece al seleccionar */}
      {!isSelected && (
        <div className="absolute left-3.5 right-3.5 bottom-0 h-[1px] bg-calma-line/60 group-hover:opacity-0 transition-opacity pointer-events-none" />
      )}
    </div>
  );
};
