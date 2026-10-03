import React, { useEffect, useRef, useState } from 'react';
import { Task, Category, Priority, Subtask, TaskLink } from '../types';
import {
  X,
  ArrowLeft,
  Trash2,
  Check,
  Link as LinkIcon,
  Pin,
} from 'lucide-react';
import { formatDateLongSpanish } from '../lib/dates';

interface TaskDetailPanelProps {
  task: Task | null;
  categories: Category[];
  onClose: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  categories,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onToggleStatus,
}) => {
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  // Escuchar tecla Escape para cerrar
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

  // Autoajuste de altura de textareas
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (task) {
      setTimeout(() => {
        autoResize(titleRef.current);
        autoResize(notesRef.current);
      }, 50);
    }
  }, [task?.id]);

  if (!task) return null;

  const isDone = task.status === 'hecha';
  const category = categories.find((c) => c.id === task.categoryId) || categories[0];

  // Helpers para actualizar campos de la tarea
  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    autoResize(e.target);
    onUpdateTask({ ...task, title: e.target.value });
  };

  const handleChangeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    autoResize(e.target);
    onUpdateTask({ ...task, description: e.target.value });
  };

  const handleChangeCategory = (catId: string) => {
    onUpdateTask({ ...task, categoryId: catId });
  };

  const handleChangeDate = (dateVal: string) => {
    onUpdateTask({ ...task, dueDate: dateVal || undefined });
  };

  const handleChangeTime = (timeVal: string) => {
    onUpdateTask({ ...task, time: timeVal || undefined });
  };

  const handleChangePriority = (prio: Priority) => {
    onUpdateTask({ ...task, priority: prio });
  };

  // Subtareas
  const handleToggleSubtask = (subId: string) => {
    const currentSubs = task.subtasks || [];
    const updated = currentSubs.map((s) =>
      s.id === subId ? { ...s, done: !s.done } : s
    );
    onUpdateTask({ ...task, subtasks: updated });
  };

  const handleAddSubtask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !newSubtaskText.trim()) return;
    e.preventDefault();
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      text: newSubtaskText.trim(),
      done: false,
    };
    const updated = [...(task.subtasks || []), newSub];
    onUpdateTask({ ...task, subtasks: updated });
    setNewSubtaskText('');
  };

  const handleDeleteSubtask = (subId: string) => {
    const updated = (task.subtasks || []).filter((s) => s.id !== subId);
    onUpdateTask({ ...task, subtasks: updated });
  };

  // Enlaces
  const normalizeUrl = (raw: string): string | null => {
    let url = raw.trim();
    if (!url) return null;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const handleAddLink = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !newLinkUrl.trim()) return;
    e.preventDefault();
    const valid = normalizeUrl(newLinkUrl);
    if (!valid) return;
    const newLink: TaskLink = {
      id: `link-${Date.now()}`,
      url: valid,
    };
    const updated = [...(task.links || []), newLink];
    onUpdateTask({ ...task, links: updated });
    setNewLinkUrl('');
  };

  const handleDeleteLink = (linkId: string) => {
    const updated = (task.links || []).filter((l) => l.id !== linkId);
    onUpdateTask({ ...task, links: updated });
  };

  return (
    <>
      {/* Backdrop universal para cerrar al hacer clic fuera (móvil y escritorio) */}
      <div
        className="fixed inset-0 bg-black/20 lg:bg-black/10 backdrop-blur-xs z-40 animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
        aria-label="Cerrar panel"
      />

      {/* Panel lateral (480px fijo a la derecha en escritorio, pantalla completa en móvil) */}
      <aside
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 z-50 w-full lg:w-[480px] bg-calma-surface border-l border-calma-line shadow-2xl flex flex-col overflow-y-auto overscroll-contain transition-transform duration-350 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
        aria-label="Detalle de la tarea"
      >
        <div className="max-w-[520px] w-full mx-auto px-6 sm:px-7 pt-[calc(20px+env(safe-area-inset-top,0px))] pb-[calc(40px+env(safe-area-inset-bottom,0px))]">
          {/* Barra superior de navegación */}
          <div className="flex items-center justify-between mb-5 -mx-2.5">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-ink hover:bg-calma-bg transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5 hidden sm:block" />
              <ArrowLeft className="w-5 h-5 sm:hidden" />
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdateTask({ ...task, isPinned: !task.isPinned })}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  task.isPinned
                    ? 'text-calma-accent bg-calma-accent-soft'
                    : 'text-calma-muted hover:text-calma-ink hover:bg-calma-bg'
                }`}
                title={task.isPinned ? 'Desfijar tarea' : 'Fijar tarea'}
                aria-label={task.isPinned ? 'Desfijar tarea' : 'Fijar tarea'}
              >
                <Pin className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
                    onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-warn hover:bg-calma-bg transition-colors"
                aria-label="Eliminar tarea"
                title="Eliminar tarea"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Título editable en Instrument Serif */}
          <textarea
            ref={titleRef}
            rows={1}
            value={task.title}
            onChange={handleChangeTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                notesRef.current?.focus();
              }
            }}
            placeholder="Sin título"
            className="w-full bg-transparent border-0 outline-none resize-none font-serif text-[34px] sm:text-[38px] leading-[1.15] tracking-tight text-calma-ink placeholder:text-calma-muted p-0 mb-6"
          />

          {/* Lista de propiedades */}
          <dl className="space-y-0 mb-7 text-[15px]">
            {/* Estado */}
            <div className="flex items-center min-h-[48px] border-t border-b border-calma-line">
              <dt className="w-24 flex-none text-calma-muted text-[14px]">Estado</dt>
              <dd className="m-0 flex items-center">
                <button
                  type="button"
                  onClick={() => onToggleStatus(task.id)}
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
                  <span>{isDone ? 'Hecha' : 'Pendiente'}</span>
                </button>
              </dd>
            </div>

            {/* Categoría */}
            <div className="flex items-center min-h-[48px] border-b border-calma-line">
              <dt className="w-24 flex-none text-calma-muted text-[14px]">Categoría</dt>
              <dd className="m-0 flex items-center gap-2 flex-1">
                <span
                  className="w-2 h-2 rounded-full flex-none"
                  style={{ backgroundColor: category?.color || 'var(--muted)' }}
                />
                <select
                  value={task.categoryId}
                  onChange={(e) => handleChangeCategory(e.target.value)}
                  className="bg-transparent border-0 outline-none text-calma-ink -ml-1 px-1 py-1 rounded-lg hover:bg-calma-bg cursor-pointer text-[15px]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </dd>
            </div>

            {/* Fecha y Hora */}
            <div className="flex items-center min-h-[48px] border-b border-calma-line">
              <dt className="w-24 flex-none text-calma-muted text-[14px]">Fecha</dt>
              <dd className="m-0 flex items-center gap-3 flex-1 flex-wrap">
                <input
                  type="date"
                  value={task.dueDate || ''}
                  onChange={(e) => handleChangeDate(e.target.value)}
                  className="bg-transparent border-0 outline-none text-calma-ink -ml-1 px-1 py-1 rounded-lg hover:bg-calma-bg cursor-pointer text-[14.5px]"
                />
                <input
                  type="time"
                  value={task.time || ''}
                  onChange={(e) => handleChangeTime(e.target.value)}
                  className="bg-transparent border-0 outline-none text-calma-muted hover:text-calma-ink px-1 py-1 rounded-lg hover:bg-calma-bg cursor-pointer text-[14.5px]"
                />
              </dd>
            </div>

            {/* Prioridad */}
            <div className="flex items-center min-h-[48px] border-b border-calma-line">
              <dt className="w-24 flex-none text-calma-muted text-[14px]">Prioridad</dt>
              <dd className="m-0 flex items-center">
                <div className="inline-flex bg-calma-bg p-1 rounded-full gap-0.5">
                  {(['baja', 'media', 'alta'] as Priority[]).map((p) => {
                    const isSelected = task.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleChangePriority(p)}
                        className={`px-3 py-1 rounded-full text-[13px] capitalize transition-all ${
                          isSelected
                            ? 'bg-calma-surface text-calma-ink shadow-calma font-medium'
                            : 'text-calma-muted hover:text-calma-ink'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </dd>
            </div>
          </dl>

          {/* Bloque: Notas */}
          <section className="mb-7">
            <h2 className="text-[14px] font-medium text-calma-muted mb-2.5">Notas</h2>
            <textarea
              ref={notesRef}
              rows={4}
              value={task.description || ''}
              onChange={handleChangeNotes}
              placeholder="Escribe aquí lo que necesites recordar…"
              className="w-full bg-calma-bg rounded-2xl p-4 text-calma-ink placeholder:text-calma-muted border-0 outline-none resize-none leading-relaxed text-[15px] focus:ring-2 focus:ring-calma-accent"
            />
          </section>

          {/* Bloque: Subtareas */}
          <section className="mb-7">
            <h2 className="text-[14px] font-medium text-calma-muted mb-2.5">Subtareas</h2>
            <ul className="space-y-1 mb-2">
              {(task.subtasks || []).map((sub) => (
                <li
                  key={sub.id}
                  className="group flex items-center gap-3 py-1.5 text-[15px] text-calma-ink"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-none ${
                      sub.done
                        ? 'bg-calma-accent border-calma-accent text-white'
                        : 'border-calma-muted text-transparent hover:border-calma-accent'
                    }`}
                    aria-label="Marcar subtarea"
                  >
                    <Check className="w-3 h-3 stroke-[2.8]" />
                  </button>

                  <span className={`flex-1 break-words ${sub.done ? 'line-through text-calma-muted' : ''}`}>
                    {sub.text}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-calma-muted opacity-0 group-hover:opacity-100 hover:text-calma-ink hover:bg-calma-bg transition-all"
                    aria-label="Quitar subtarea"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            <input
              type="text"
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onKeyDown={handleAddSubtask}
              placeholder="+ Añadir subtarea (pulsa Enter)"
              className="w-full bg-transparent border-b border-dashed border-calma-line focus:border-calma-accent outline-none text-[15px] text-calma-ink placeholder:text-calma-muted py-2 transition-colors"
            />
          </section>

          {/* Bloque: Enlaces */}
          <section className="mb-7">
            <h2 className="text-[14px] font-medium text-calma-muted mb-2.5">Enlaces</h2>
            <ul className="space-y-2 mb-2">
              {(task.links || []).map((link) => (
                <li
                  key={link.id}
                  className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-calma-bg text-calma-muted text-[14px]"
                >
                  <LinkIcon className="w-4 h-4 flex-none" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate text-calma-ink hover:underline"
                  >
                    {getDomain(link.url)}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-calma-muted opacity-0 group-hover:opacity-100 hover:text-calma-ink transition-opacity"
                    aria-label="Quitar enlace"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            <input
              type="text"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={handleAddLink}
              placeholder="+ Pega un enlace y pulsa Enter"
              className="w-full bg-transparent border-b border-dashed border-calma-line focus:border-calma-accent outline-none text-[15px] text-calma-ink placeholder:text-calma-muted py-2 transition-colors"
            />
          </section>

          {/* Bloque: Integraciones */}
          <section className="mb-8">
            <h2 className="text-[14px] font-medium text-calma-muted mb-2.5">Integraciones</h2>
            <div className="border border-dashed border-calma-line rounded-2xl p-4 text-[14px] text-calma-muted">
              <p className="m-0">Conecta esta tarea con tus herramientas. Próximamente.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Calendario', 'Drive', 'Notion', 'Correo'].map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1 rounded-full bg-calma-bg text-[13px] text-calma-muted select-none"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Pie: Fecha de creación */}
          <p className="text-[13px] text-calma-muted m-0">
            {task.createdAt && `Creada el ${formatDateLongSpanish(task.createdAt.split('T')[0])}`}
          </p>
        </div>
      </aside>
    </>
  );
};
