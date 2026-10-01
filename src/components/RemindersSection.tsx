import React, { useState } from 'react';
import { Reminder } from '../types';
import { formatDateFriendly } from '../lib/dates';
import { Check, Plus, Trash2, Bell, Clock, Calendar } from 'lucide-react';

interface RemindersSectionProps {
  reminders: Reminder[];
  onAddReminder: (title: string, dueDate?: string, dueTime?: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersSection: React.FC<RemindersSectionProps> = ({
  reminders,
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado de la sección */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            Recordatorios Rápidos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Avisos puntuales y pendientes sin la complejidad de una tarea formal.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {activeReminders.length} pendientes
        </span>
      </div>

      {/* Formulario rápido para añadir */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribe un recordatorio rápido..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
              showOptions || dueDate || dueTime
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Añadir fecha/hora"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-40 rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
        </div>

        {/* Campos opcionales de fecha/hora */}
        {showOptions && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        )}
      </form>

      {/* Lista de recordatorios pendientes */}
      <div className="space-y-2">
        {activeReminders.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-900/30">
            <p className="text-xs text-slate-400">No hay recordatorios pendientes. ¡Todo despejado!</p>
          </div>
        ) : (
          activeReminders.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => onToggleReminder(r.id)}
                  className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 hover:border-slate-500 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  {r.isCompleted && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block truncate">
                    {r.title}
                  </span>
                  {(r.dueDate || r.dueTime) && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {r.dueDate && formatDateFriendly(r.dueDate)}
                      {r.dueTime && ` a las ${r.dueTime}`}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDeleteReminder(r.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
                title="Eliminar recordatorio"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Recordatorios completados */}
      {completedReminders.length > 0 && (
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Completados ({completedReminders.length})
          </span>
          {completedReminders.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200/60 dark:border-slate-800/60 opacity-60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => onToggleReminder(r.id)}
                  className="w-5 h-5 rounded-md bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900 flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs line-through text-slate-400 dark:text-slate-500 truncate">
                  {r.title}
                </span>
              </div>
              <button
                onClick={() => onDeleteReminder(r.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
