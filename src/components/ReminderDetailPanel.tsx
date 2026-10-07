import React, { useEffect, useRef, useState } from 'react';
import { Reminder } from '../types';
import { X, ArrowLeft, Trash2, Check, Clock, Calendar } from 'lucide-react';
import { formatDateLongSpanish } from '../lib/dates';
import { ConfirmModal } from './ConfirmModal';

interface ReminderDetailPanelProps {
  reminder: Reminder | null;
  onClose: () => void;
  onUpdateReminder: (updated: Reminder) => void;
  onDeleteReminder: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const ReminderDetailPanel: React.FC<ReminderDetailPanelProps> = ({
  reminder,
  onClose,
  onUpdateReminder,
  onDeleteReminder,
  onToggleStatus,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  // Escuchar Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Escuchar clic fuera del panel para cerrar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (reminder) {
      setTimeout(() => {
        autoResize(titleRef.current);
        autoResize(notesRef.current);
      }, 50);
    }
  }, [reminder?.id]);

  if (!reminder) return null;

  const isDone = reminder.isCompleted;

  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    autoResize(e.target);
    onUpdateReminder({ ...reminder, title: e.target.value });
  };

  const handleChangeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    autoResize(e.target);
    onUpdateReminder({ ...reminder, notes: e.target.value });
  };

  const handleChangeDate = (dateVal: string) => {
    onUpdateReminder({ ...reminder, dueDate: dateVal || undefined });
  };

  const handleChangeTime = (timeVal: string) => {
    onUpdateReminder({ ...reminder, dueTime: timeVal || undefined });
  };

  return (
    <>
      {/* Backdrop universal para cerrar al hacer clic fuera (móvil y escritorio) */}
      <div
        className="fixed inset-0 bg-black/20 lg:bg-black/10 backdrop-blur-xs z-40 animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
        aria-label="Cerrar panel"
      />

      {/* Panel lateral deslizante de 480px */}
      <aside
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 z-50 w-full lg:w-[480px] bg-calma-surface border-l border-calma-line shadow-2xl flex flex-col overflow-y-auto overscroll-contain transition-transform duration-350 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
        aria-label="Detalle del recordatorio"
      >
        <div className="max-w-[520px] w-full mx-auto px-6 sm:px-7 pt-[calc(20px+env(safe-area-inset-top,0px))] pb-[calc(40px+env(safe-area-inset-bottom,0px))]">
          {/* Barra superior de acciones */}
          <div className="flex items-center justify-between mb-5 -mx-2.5">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-ink hover:bg-calma-bg transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5 hidden sm:block" />
              <ArrowLeft className="w-5 h-5 sm:hidden" />
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-warn hover:bg-calma-bg transition-colors cursor-pointer"
              aria-label="Eliminar recordatorio"
              title="Eliminar recordatorio"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Título editable en Instrument Serif */}
          <textarea
            ref={titleRef}
            rows={1}
            value={reminder.title}
            onChange={handleChangeTitle}
            placeholder="Sin título"
            className="w-full bg-transparent border-0 outline-none resize-none font-serif text-[34px] sm:text-[38px] leading-[1.15] tracking-tight text-calma-ink placeholder:text-calma-muted p-0 mb-6"
          />

          {/* Lista de propiedades del recordatorio */}
          <dl className="space-y-0 mb-7 text-[15px]">
            {/* Estado */}
            <div className="flex items-center min-h-[48px] border-t border-b border-calma-line">
              <dt className="w-24 flex-none text-calma-muted text-[14px]">Estado</dt>
              <dd className="m-0 flex items-center">
                <button
                  type="button"
                  onClick={() => onToggleStatus(reminder.id)}
                  className="inline-flex items-center gap-2.5 px-2 py-1 -ml-2 rounded-lg hover:bg-calma-bg transition-colors text-calma-ink"
                >
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-calma-accent border-calma-accent text-white'
                        : 'border-calma-muted text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[2.8]" />
                  </span>
                  <span>{isDone ? 'Completado' : 'Pendiente'}</span>
                </button>
              </dd>
            </div>

            {/* Fecha */}
            <div className="flex items-center min-h-[48px] border-b border-calma-line">
              <dt className="w-24 flex-none text-calma-muted text-[14px]">Fecha</dt>
              <dd className="m-0 flex items-center gap-2 flex-1">
                <Calendar className="w-4 h-4 text-calma-muted flex-none" />
                <input
                  type="date"
                  value={reminder.dueDate || ''}
                  onChange={(e) => handleChangeDate(e.target.value)}
                  className="bg-transparent border-0 outline-none text-calma-ink px-1 py-1 rounded-lg hover:bg-calma-bg cursor-pointer text-[14.5px]"
                />
              </dd>
            </div>

            {/* Hora */}
            <div className="flex items-center min-h-[48px] border-b border-calma-line">
              <dt className="w-24 flex-none text-calma-muted text-[14px]">Hora</dt>
              <dd className="m-0 flex items-center gap-2 flex-1">
                <Clock className="w-4 h-4 text-calma-muted flex-none" />
                <input
                  type="time"
                  value={reminder.dueTime || ''}
                  onChange={(e) => handleChangeTime(e.target.value)}
                  className="bg-transparent border-0 outline-none text-calma-ink px-1 py-1 rounded-lg hover:bg-calma-bg cursor-pointer text-[14.5px]"
                />
              </dd>
            </div>
          </dl>

          {/* Bloque: Notas del recordatorio */}
          <section className="mb-7">
            <h2 className="text-[14px] font-medium text-calma-muted mb-2.5">Detalles y Notas</h2>
            <textarea
              ref={notesRef}
              rows={4}
              value={reminder.notes || ''}
              onChange={handleChangeNotes}
              placeholder="Añade apuntes o detalles sobre este recordatorio…"
              className="w-full bg-calma-bg rounded-2xl p-4 text-calma-ink placeholder:text-calma-muted border-0 outline-none resize-none leading-relaxed text-[15px] focus:ring-2 focus:ring-calma-accent"
            />
          </section>

          {/* Pie: Fecha de creación */}
          <p className="text-[13px] text-calma-muted m-0">
            {reminder.createdAt && `Creado el ${formatDateLongSpanish(reminder.createdAt.split('T')[0])}`}
          </p>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showConfirmDelete}
        title="Eliminar recordatorio"
        message={`¿Estás seguro de que deseas eliminar «${reminder.title}»? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Conservar"
        isDanger={true}
        onConfirm={() => {
          onDeleteReminder(reminder.id);
          setShowConfirmDelete(false);
          onClose();
        }}
        onClose={() => setShowConfirmDelete(false)}
      />
    </>
  );
};
