import React, { useState, useRef } from 'react';
import { Task, Category } from '../types';
import { Check, Link as LinkIcon, Pin, Trash2 } from 'lucide-react';
import { formatDateFriendly } from '../lib/dates';
import { ConfirmModal } from './ConfirmModal';

interface TaskCardProps {
  task: Task;
  category?: Category;
  isSelected?: boolean;
  onSelect: (task: Task) => void;
  onToggle: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  showDateBadge?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  isSelected,
  onSelect,
  onToggle,
  onTogglePin,
  onDelete,
  showDateBadge,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isDone = task.status === 'hecha';

  // Subtareas completadas vs totales
  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.done).length || 0;
  const hasLinks = (task.links?.length || 0) > 0;

  // Estado y referencias para gestos táctiles en móvil (deslizar izq/der)
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const isVerticalScroll = useRef(false);
  const hasSwiped = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
    isVerticalScroll.current = false;
    hasSwiped.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || isVerticalScroll.current) return;

    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    // Detectar dirección del gesto
    if (!isHorizontalSwipe.current && !isVerticalScroll.current) {
      if (Math.abs(diffY) > 8 && Math.abs(diffY) > Math.abs(diffX)) {
        isVerticalScroll.current = true;
        return;
      }
      if (Math.abs(diffX) > 8 && Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontalSwipe.current = true;
        setIsDragging(true);
      }
    }

    if (isHorizontalSwipe.current) {
      hasSwiped.current = true;
      let currentOffset = diffX;

      // Si no hay soporte para pin y se desliza a la izquierda, amortiguar fuertemente
      if (diffX < 0 && !onTogglePin) {
        currentOffset = diffX * 0.1;
      } else {
        const maxOffset = 100;
        if (Math.abs(diffX) > maxOffset) {
          const excess = Math.abs(diffX) - maxOffset;
          const sign = diffX > 0 ? 1 : -1;
          currentOffset = sign * (maxOffset + excess * 0.2);
        }
      }
      setSwipeOffset(currentOffset);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current) {
      const SWIPE_THRESHOLD = 60;
      if (swipeOffset > SWIPE_THRESHOLD) {
        // Deslizar a la derecha: Cambiar estado (Completar / Reabrir)
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(25);
          } catch {}
        }
        onToggle(task.id);
      } else if (swipeOffset < -SWIPE_THRESHOLD && onTogglePin) {
        // Deslizar a la izquierda: Fijar / Desfijar
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(25);
          } catch {}
        }
        onTogglePin(task.id);
      }
    }

    setIsDragging(false);
    setSwipeOffset(0);
    isHorizontalSwipe.current = false;
    isVerticalScroll.current = false;

    // Evitar que el clic nativo se dispare tras completar un deslizamiento
    if (hasSwiped.current) {
      setTimeout(() => {
        hasSwiped.current = false;
      }, 150);
    }
  };

  const handleTouchCancel = () => {
    setIsDragging(false);
    setSwipeOffset(0);
    isHorizontalSwipe.current = false;
    isVerticalScroll.current = false;
    setTimeout(() => {
      hasSwiped.current = false;
    }, 150);
  };

  const handleClick = () => {
    if (hasSwiped.current) return;
    onSelect(task);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl select-none touch-pan-y">
      {/* Fondo de acción al deslizar a la derecha: Completar */}
      {swipeOffset > 0 && (
        <div
          className={`absolute inset-0 flex items-center pl-4 rounded-2xl transition-colors ${
            isDone ? 'bg-calma-surface text-calma-muted' : 'bg-calma-accent text-white'
          }`}
        >
          <div
            className="flex items-center gap-2 font-medium text-[13px]"
            style={{
              opacity: Math.min(1, Math.max(0.3, swipeOffset / 50)),
              transform: `scale(${Math.min(1.1, Math.max(0.85, 0.7 + swipeOffset / 140))})`,
            }}
          >
            <Check className="w-4 h-4 stroke-[2.8]" />
            <span>{isDone ? 'Desmarcar' : 'Completar'}</span>
          </div>
        </div>
      )}

      {/* Fondo de acción al deslizar a la izquierda: Fijar / Desfijar */}
      {swipeOffset < 0 && onTogglePin && (
        <div className="absolute inset-0 flex items-center justify-end pr-4 rounded-2xl bg-calma-accent-soft text-calma-accent">
          <div
            className="flex items-center gap-2 font-medium text-[13px]"
            style={{
              opacity: Math.min(1, Math.max(0.3, Math.abs(swipeOffset) / 50)),
              transform: `scale(${Math.min(1.1, Math.max(0.85, 0.7 + Math.abs(swipeOffset) / 140))})`,
            }}
          >
            <span>{task.isPinned ? 'Desfijar' : 'Fijar'}</span>
            <Pin className="w-4 h-4 fill-calma-accent/30" />
          </div>
        </div>
      )}

      {/* Tarjeta frontal deslizable */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`group relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl cursor-pointer transition-[background-color,border-color] duration-150 border ${
          swipeOffset !== 0
            ? 'bg-calma-surface shadow-sm border-calma-line/60'
            : isSelected
            ? 'bg-calma-surface rounded-2xl shadow-calma border-calma-line/80'
            : isDone
            ? 'opacity-70 hover:bg-calma-surface/50 border-transparent bg-transparent'
            : 'hover:bg-calma-surface/60 border-transparent bg-transparent'
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

            {/* Fecha programada */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center text-xs font-medium ${
                  showDateBadge ? 'text-calma-ink/80 bg-calma-bg px-1.5 py-0.5 rounded-md border border-calma-line/60' : 'text-calma-muted/90'
                }`}
              >
                {formatDateFriendly(task.dueDate)}
              </span>
            )}

            {subtasksCount > 0 && (
              <span className="inline-flex items-center text-xs text-calma-muted/90 font-medium">
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
                : 'hidden sm:block text-calma-muted opacity-0 sm:group-hover:opacity-100 hover:text-calma-ink hover:bg-calma-surface'
            }`}
            title={task.isPinned ? 'Desfijar tarea' : 'Fijar tarea'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Botón para eliminar rápidamente en escritorio */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmModal(true);
            }}
            className="p-1.5 rounded-lg transition-all flex-none hidden sm:block text-calma-muted opacity-0 sm:group-hover:opacity-100 hover:text-calma-warn hover:bg-calma-surface cursor-pointer"
            title="Eliminar tarea"
            aria-label="Eliminar tarea"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Separador plano inferior (sin curvas extrañas), que desaparece al seleccionar o deslizar */}
        {!isSelected && swipeOffset === 0 && (
          <div className="absolute left-3.5 right-3.5 bottom-0 h-[1px] bg-calma-line/60 group-hover:opacity-0 transition-opacity pointer-events-none" />
        )}
      </div>
    </div>

    <ConfirmModal
      isOpen={showConfirmModal}
      title="Eliminar tarea"
      message={`¿Estás seguro de que deseas eliminar «${task.title}»? Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      cancelText="Conservar"
      isDanger={true}
      onConfirm={() => {
        if (onDelete) {
          onDelete(task.id);
        }
        setShowConfirmModal(false);
      }}
      onClose={() => setShowConfirmModal(false)}
    />
  </>
  );
};
