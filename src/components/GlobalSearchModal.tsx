import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Bell,
  FileText,
  ArrowRight,
  Clock,
  CornerDownLeft,
} from 'lucide-react';
import { Task, Reminder, Note, Category, NavSection } from '../types';
import { formatDateFriendly } from '../lib/dates';

export type SearchResultType = 'task' | 'reminder' | 'note' | 'section';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  date?: string;
  categoryColor?: string;
  categoryName?: string;
  isCompleted?: boolean;
  priority?: string;
  rawItem: any;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  reminders: Reminder[];
  notes: Note[];
  categories: Category[];
  onSelectTask: (task: Task) => void;
  onSelectReminder: (reminder: Reminder) => void;
  onNavigateSection: (section: NavSection) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  reminders,
  notes,
  categories,
  onSelectTask,
  onSelectReminder,
  onNavigateSection,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Mapa de categorías para acceso rápido
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Enfocar input al abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Resultados de búsqueda calculados
  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: SearchResultItem[] = [];

    // Si la búsqueda está vacía, mostramos sugerencias inteligentes (tareas urgentes y notas recientes)
    if (!q) {
      // 1. Tareas pendientes más próximas
      const pendingTasks = tasks
        .filter((t) => t.status === 'pendiente')
        .slice(0, 4);

      pendingTasks.forEach((t) => {
        const cat = categoryMap.get(t.categoryId);
        items.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          subtitle: t.description || undefined,
          date: t.dueDate,
          categoryName: cat?.name,
          categoryColor: cat?.color,
          isCompleted: false,
          priority: t.priority,
          rawItem: t,
        });
      });

      // 2. Notas recientes
      notes.slice(0, 3).forEach((n) => {
        items.push({
          id: `note-${n.id}`,
          type: 'note',
          title: n.title || 'Nota sin título',
          subtitle: n.content ? n.content.substring(0, 60) : undefined,
          rawItem: n,
        });
      });

      return items;
    }

    // A. Buscar en Secciones directas de la app
    const sections: { id: NavSection; label: string; keywords: string[] }[] = [
      { id: 'tareas', label: 'Tareas y Entregas', keywords: ['tarea', 'tareas', 'hoy', 'proximos', 'hechas', 'todo'] },
      { id: 'calendario', label: 'Calendario Mensual', keywords: ['calendario', 'mes', 'agenda', 'fechas'] },
      { id: 'recordatorios', label: 'Recordatorios Rápidos', keywords: ['recordatorio', 'recordatorios', 'alarmas', 'avisos'] },
      { id: 'notas', label: 'Notas y Apuntes', keywords: ['nota', 'notas', 'apuntes', 'ideas', 'textos'] },
      { id: 'ajustes', label: 'Ajustes y Preferencias', keywords: ['ajustes', 'configuracion', 'copia', 'backup', 'tema'] },
    ];

    sections.forEach((sec) => {
      if (
        sec.label.toLowerCase().includes(q) ||
        sec.keywords.some((k) => k.includes(q))
      ) {
        items.push({
          id: `sec-${sec.id}`,
          type: 'section',
          title: `Ir a ${sec.label}`,
          subtitle: 'Navegación directa',
          rawItem: sec.id,
        });
      }
    });

    // B. Buscar en Tareas
    tasks.forEach((t) => {
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchSub = t.subtasks?.some((s) => s.text.toLowerCase().includes(q));

      if (matchTitle || matchDesc || matchSub) {
        const cat = categoryMap.get(t.categoryId);
        items.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          subtitle: t.description || (matchSub ? 'Coincidencia en subtarea' : undefined),
          date: t.dueDate,
          categoryName: cat?.name,
          categoryColor: cat?.color,
          isCompleted: t.status === 'hecha',
          priority: t.priority,
          rawItem: t,
        });
      }
    });

    // C. Buscar en Recordatorios
    reminders.forEach((r) => {
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchNotes = r.notes?.toLowerCase().includes(q);

      if (matchTitle || matchNotes) {
        items.push({
          id: `rem-${r.id}`,
          type: 'reminder',
          title: r.title,
          subtitle: r.notes || undefined,
          date: r.dueDate,
          isCompleted: r.isCompleted,
          rawItem: r,
        });
      }
    });

    // D. Buscar en Notas
    notes.forEach((n) => {
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);

      if (matchTitle || matchContent) {
        items.push({
          id: `note-${n.id}`,
          type: 'note',
          title: n.title || 'Nota sin título',
          subtitle: n.content ? n.content.substring(0, 80) : undefined,
          rawItem: n,
        });
      }
    });

    return items;
  }, [query, tasks, reminders, notes, categoryMap]);

  // Asegurar que el índice seleccionado esté dentro de rango
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Asegurar que el elemento seleccionado esté visible en scroll
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Ejecutar selección
  const handleSelect = (item: SearchResultItem) => {
    if (item.type === 'task') {
      onSelectTask(item.rawItem as Task);
    } else if (item.type === 'reminder') {
      onSelectReminder(item.rawItem as Reminder);
    } else if (item.type === 'note') {
      onNavigateSection('notas');
    } else if (item.type === 'section') {
      onNavigateSection(item.rawItem as NavSection);
    }
    onClose();
  };

  // Manejador de teclado para flechas, enter y escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Icono según tipo
  const getTypeIcon = (type: SearchResultType) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-calma-accent" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-calma-warn" />;
      case 'note':
        return <FileText className="w-4 h-4 text-[#7E9CB8]" />;
      case 'section':
        return <ArrowRight className="w-4 h-4 text-calma-muted" />;
    }
  };

  // Etiqueta del tipo
  const getTypeBadge = (type: SearchResultType) => {
    switch (type) {
      case 'task':
        return 'Tarea';
      case 'reminder':
        return 'Recordatorio';
      case 'note':
        return 'Nota';
      case 'section':
        return 'Sección';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 p-3 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-calma-surface rounded-2xl border border-calma-line shadow-2xl flex flex-col overflow-hidden animate-page-popup"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* 1. Barra de entrada de búsqueda */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-calma-line flex-none">
          <Search className="w-5 h-5 text-calma-muted flex-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tareas, notas, recordatorios... (Esc para salir)"
            className="flex-1 bg-transparent text-calma-ink placeholder:text-calma-muted text-sm sm:text-base focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg transition-colors"
              title="Borrar texto"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-sans font-medium text-calma-muted bg-calma-bg rounded border border-calma-line">
              ESC
            </kbd>
          )}
        </div>

        {/* 2. Lista de resultados scrolleable */}
        <div
          ref={listRef}
          className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-calma-line/20"
        >
          {results.length > 0 ? (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`pt-1 first:pt-0 p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-calma-accent-soft text-calma-ink'
                      : 'hover:bg-calma-bg/80 text-calma-ink'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="mt-0.5 flex-none">{getTypeIcon(item.type)}</div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-[13.5px] font-medium truncate ${
                            item.isCompleted ? 'line-through text-calma-muted' : 'text-calma-ink'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.categoryName && (
                          <span
                            className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-full border border-calma-line flex-none"
                            style={{ color: item.categoryColor }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: item.categoryColor }}
                            />
                            {item.categoryName}
                          </span>
                        )}
                      </div>

                      {item.subtitle && (
                        <p className="text-[11px] text-calma-muted truncate m-0">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-none">
                    {item.date && (
                      <span className="hidden sm:flex items-center gap-1 text-[11px] text-calma-muted">
                        <Clock className="w-3 h-3" />
                        {formatDateFriendly(item.date)}
                      </span>
                    )}

                    <span className="text-[10px] font-medium uppercase tracking-wider text-calma-muted px-1.5 py-0.5 rounded bg-calma-bg border border-calma-line/60">
                      {getTypeBadge(item.type)}
                    </span>

                    {isSelected && (
                      <CornerDownLeft className="hidden sm:block w-3.5 h-3.5 text-calma-accent" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 px-4 text-center">
              <p className="font-serif text-lg text-calma-ink m-0">
                Sin resultados para «{query}»
              </p>
              <p className="text-xs text-calma-muted mt-1.5 m-0">
                Prueba buscando por título, asignatura o palabras de tus notas.
              </p>
            </div>
          )}
        </div>

        {/* 3. Pie del Modal con atajos */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-calma-bg/70 border-t border-calma-line text-[11px] text-calma-muted flex-none">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-sans px-1 py-0.5 bg-calma-surface rounded border border-calma-line text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="font-sans px-1 py-0.5 bg-calma-surface rounded border border-calma-line text-[10px]">
                ↓
              </kbd>{' '}
              navegar
            </span>
            <span>
              <kbd className="font-sans px-1.5 py-0.5 bg-calma-surface rounded border border-calma-line text-[10px]">
                ↵
              </kbd>{' '}
              abrir
            </span>
          </div>
          <span>Rekayu · Búsqueda global</span>
        </div>
      </div>
    </div>
  );
};
