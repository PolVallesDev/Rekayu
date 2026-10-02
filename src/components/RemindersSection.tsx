import React, { useState } from 'react';
import { Reminder } from '../types';
import { formatDateFriendly } from '../lib/dates';
import { Check, Plus, Trash2, Clock, Calendar } from 'lucide-react';

interface RemindersSectionProps {
  reminders: Reminder[];
  selectedReminderId?: string | null;
  onSelectReminder: (reminder: Reminder) => void;
  onAddReminder: (title: string, dueDate?: string, dueTime?: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersSection: React.FC<RemindersSectionProps> = ({
  reminders,
  selectedReminderId,
  onSelectReminder,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
}) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddReminder(title.trim(), dueDate || undefined, dueTime || undefined);
    setTitle('');
    setDueDate('');
    setDueTime('');
    setShowOptions(false);
  };

  const activeReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

  return (
    <div className="space-y-6">
      {/* Formulario para añadir recordatorio rápido */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 bg-calma-surface rounded-2xl border border-calma-line shadow-calma space-y-2.5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribe un recordatorio rápido…"
            className="flex-1 px-3 py-2 text-[14.5px] bg-calma-bg rounded-xl border-0 text-calma-ink placeholder:text-calma-muted focus:outline-none focus:ring-2 focus:ring-calma-accent"
          />
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2.5 rounded-xl text-sm border transition-colors ${
              showOptions || dueDate || dueTime
                ? 'bg-calma-accent-soft border-calma-accent text-calma-accent'
                : 'bg-calma-bg border-transparent text-calma-muted hover:text-calma-ink'
            }`}
            title="Añadir fecha/hora"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-calma-accent text-white hover:opacity-90 disabled:opacity-40 rounded-xl text-sm font-medium transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir</span>
          </button>
        </div>

        {/* Campos opcionales de fecha/hora */}
        {showOptions && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-calma-line text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-calma-muted" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-2 py-1 bg-calma-bg rounded-lg border-0 text-xs text-calma-ink focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-calma-muted" />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="px-2 py-1 bg-calma-bg rounded-lg border-0 text-xs text-calma-ink focus:outline-none"
              />
            </div>
          </div>
        )}
      </form>

      {/* Lista de recordatorios pendientes */}
      <div className="space-y-2">
        {activeReminders.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-calma-line rounded-2xl">
            <p className="text-[14px] text-calma-muted m-0">No hay recordatorios pendientes. ¡Todo despejado!</p>
          </div>
        ) : (
          activeReminders.map((r) => {
            const isSelected = selectedReminderId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => onSelectReminder(r)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? 'bg-calma-surface rounded-2xl shadow-md ring-1 ring-calma-line/70'
                    : 'bg-calma-surface/90 border-calma-line/60 hover:border-calma-line shadow-calma'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleReminder(r.id);
                    }}
                    className="w-5 h-5 rounded-full border border-calma-muted/70 hover:border-calma-accent text-transparent flex items-center justify-center transition-colors flex-shrink-0"
                    aria-label="Marcar como completado"
                  >
                    {r.isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.8]" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <span className="text-[15px] font-normal text-calma-ink block truncate">
                      {r.title}
                    </span>

                    {/* Etiquetas visibles de Día y Hora */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {r.dueDate && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-calma-bg text-calma-ink border border-calma-line/60">
                          <Calendar className="w-3 h-3 text-calma-muted" />
                          <span>{formatDateFriendly(r.dueDate)}</span>
                        </span>
                      )}
                      {r.dueTime && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-calma-bg text-calma-ink border border-calma-line/60">
                          <Clock className="w-3 h-3 text-calma-muted" />
                          <span>{r.dueTime}</span>
                        </span>
                      )}
                      {r.notes && (
                        <span className="text-[11px] text-calma-muted italic truncate max-w-[200px]">
                          {r.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteReminder(r.id);
                  }}
                  className="p-1.5 text-calma-muted hover:text-calma-warn rounded-lg hover:bg-calma-bg transition-colors ml-2"
                  title="Eliminar recordatorio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Recordatorios completados */}
      {completedReminders.length > 0 && (
        <div className="pt-4 border-t border-calma-line space-y-2">
          <span className="text-[13px] font-medium text-calma-muted uppercase tracking-wider block">
            Completados ({completedReminders.length})
          </span>
          {completedReminders.map((r) => {
            const isSelected = selectedReminderId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => onSelectReminder(r)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer opacity-60 transition-all ${
                  isSelected
                    ? 'bg-calma-surface rounded-xl shadow-md ring-1 ring-calma-line'
                    : 'bg-calma-surface/40 border-calma-line/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleReminder(r.id);
                    }}
                    className="w-5 h-5 rounded-full bg-calma-accent text-white flex items-center justify-center flex-shrink-0"
                    aria-label="Marcar como pendiente"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                  </button>
                  <div className="min-w-0 truncate">
                    <span className="text-[14px] line-through text-calma-muted block truncate">
                      {r.title}
                    </span>
                    {(r.dueDate || r.dueTime) && (
                      <span className="text-[11.5px] text-calma-muted">
                        {r.dueDate && formatDateFriendly(r.dueDate)} {r.dueTime && `· ${r.dueTime}`}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteReminder(r.id);
                  }}
                  className="p-1.5 text-calma-muted hover:text-calma-warn rounded-lg hover:bg-calma-bg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
