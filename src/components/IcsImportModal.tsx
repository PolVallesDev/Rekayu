import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  CheckSquare,
  Square,
  AlertCircle,
  Clock,
  Tag,
  Flag,
  Bell,
  Sparkles,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Task, Category, Priority } from '../types';
import { ParsedIcsEvent } from '../lib/icalParser';
import { formatDateShortSpanish } from '../lib/dates';

interface IcsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedEvents: ParsedIcsEvent[];
  existingTasks: Task[];
  categories: Category[];
  onConfirmImport: (
    tasksToImport: Task[],
    reminderConfig?: { enabled: boolean; daysAhead: number }
  ) => void;
}

interface EditableImportItem extends ParsedIcsEvent {
  selected: boolean;
  categoryId: string;
  priority: Priority;
  customTitle: string;
  isDuplicate: boolean;
}

export const IcsImportModal: React.FC<IcsImportModalProps> = ({
  isOpen,
  onClose,
  parsedEvents,
  existingTasks,
  categories,
  onConfirmImport,
}) => {
  const [items, setItems] = useState<EditableImportItem[]>([]);
  const [useCleanTitles, setUseCleanTitles] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(60);
  const [expandedDescId, setExpandedDescId] = useState<string | null>(null);

  // Inicializar items al recibir parsedEvents
  useEffect(() => {
    if (!isOpen || parsedEvents.length === 0) return;

    // Mapa de categorías existentes por id o nombre
    const availableCategoryIds = new Set(categories.map((c) => c.id));
    const fallbackCategory = categories[0]?.id || 'cat-clase';

    const normalized = parsedEvents.map((ev) => {
      // Comprobar si ya existe una tarea igual por título y fecha
      const isDuplicate = existingTasks.some((t) => {
        const titleMatch =
          t.title.trim().toLowerCase() === ev.cleanTitle.trim().toLowerCase() ||
          t.title.trim().toLowerCase() === ev.rawTitle.trim().toLowerCase();
        const dateMatch = !ev.dueDate || !t.dueDate || t.dueDate === ev.dueDate;
        return titleMatch && dateMatch;
      });

      // Validar categoría sugerida
      let catId = ev.suggestedCategory;
      if (!availableCategoryIds.has(catId)) {
        // Si no existe 'cat-examenes', buscar por nombre
        const matched = categories.find((c) =>
          c.name.toLowerCase().includes(catId === 'cat-examenes' ? 'examen' : 'clase')
        );
        catId = matched ? matched.id : fallbackCategory;
      }

      return {
        ...ev,
        selected: !isDuplicate, // Deseleccionar por defecto las duplicadas para evitar errores
        categoryId: catId,
        priority: ev.suggestedPriority,
        customTitle: useCleanTitles ? ev.cleanTitle : ev.rawTitle,
        isDuplicate,
      };
    });

    setItems(normalized);
  }, [isOpen, parsedEvents, existingTasks, categories, useCleanTitles]);

  // Contadores
  const selectedCount = useMemo(() => items.filter((i) => i.selected).length, [items]);
  const duplicateCount = useMemo(() => items.filter((i) => i.isDuplicate).length, [items]);

  if (!isOpen) return null;

  // Alternar selección de un ítem
  const handleToggleSelect = (uid: string) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, selected: !item.selected } : item))
    );
  };

  // Seleccionar / Deseleccionar todas
  const handleSelectAll = (select: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  // Cambiar categoría de un ítem
  const handleChangeCategory = (uid: string, categoryId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, categoryId } : item))
    );
  };

  // Cambiar prioridad de un ítem
  const handleChangePriority = (uid: string, priority: Priority) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, priority } : item))
    );
  };

  // Editar título
  const handleEditTitle = (uid: string, customTitle: string) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, customTitle } : item))
    );
  };

  // Asignar categoría en masa a las seleccionadas
  const handleBatchCategory = (categoryId: string) => {
    if (!categoryId) return;
    setItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, categoryId } : item))
    );
  };

  // Asignar prioridad en masa a las seleccionadas
  const handleBatchPriority = (priority: Priority) => {
    setItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, priority } : item))
    );
  };

  // Alternar limpieza de prefijos (Moodle / LMS)
  const handleToggleCleanTitles = () => {
    const nextVal = !useCleanTitles;
    setUseCleanTitles(nextVal);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        customTitle: nextVal ? item.cleanTitle : item.rawTitle,
      }))
    );
  };

  // Confirmar e importar
  const handleConfirm = () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return;

    const newTasks: Task[] = selectedItems.map((item) => ({
      id: `task-ics-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: item.customTitle.trim() || item.cleanTitle || 'Tarea de calendario',
      description: item.description || undefined,
      dueDate: item.dueDate || undefined,
      time: item.time || undefined,
      priority: item.priority,
      categoryId: item.categoryId,
      status: 'pendiente',
      links: item.links && item.links.length > 0 ? item.links : undefined,
      createdAt: new Date().toISOString(),
    }));

    onConfirmImport(newTasks, {
      enabled: reminderEnabled,
      daysAhead: reminderDays,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-calma-surface rounded-2xl shadow-2xl border border-calma-line flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Cabecera del Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-calma-line flex-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-calma-accent-soft flex items-center justify-center text-calma-accent">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-normal text-calma-ink m-0">
                Importar Calendario (.ics)
              </h2>
              <p className="text-xs text-calma-muted m-0">
                {items.length} eventos leídos · {selectedCount} seleccionados para importar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Barra de Herramientas y Acciones Rápidas */}
        <div className="p-3 sm:px-5 bg-calma-bg/60 border-b border-calma-line flex-none space-y-2.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Selección rápida */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="px-2 py-1 rounded-md bg-calma-surface border border-calma-line text-calma-ink hover:border-calma-accent transition-colors font-medium flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5 text-calma-accent" />
                <span>Todas</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="px-2 py-1 rounded-md bg-calma-surface border border-calma-line text-calma-muted hover:text-calma-ink transition-colors"
              >
                Ninguna
              </button>

              {duplicateCount > 0 && (
                <span className="text-[11px] text-calma-muted flex items-center gap-1 ml-1">
                  <AlertCircle className="w-3 h-3 text-calma-warn" />
                  {duplicateCount} ya en Rekayu (desmarcadas)
                </span>
              )}
            </div>

            {/* Alternador de limpiar prefijos */}
            <button
              type="button"
              onClick={handleToggleCleanTitles}
              className={`px-2.5 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                useCleanTitles
                  ? 'bg-calma-accent-soft border-calma-accent text-calma-ink'
                  : 'bg-calma-surface border-calma-line text-calma-muted hover:text-calma-ink'
              }`}
              title="Quitar textos como 'Venciment de', 'Due date', 'Entrega de'..."
            >
              <Sparkles className="w-3 h-3 text-calma-accent" />
              <span>Limpiar prefijos LMS ({useCleanTitles ? 'Activado' : 'Original'})</span>
            </button>
          </div>

          {/* Asignación en lote para las seleccionadas */}
          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-calma-line/60 text-[11px] text-calma-muted">
              <span>Asignar a seleccionadas:</span>
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                <select
                  aria-label="Asignar categoría en masa a las seleccionadas"
                  onChange={(e) => {
                    handleBatchCategory(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  className="bg-calma-surface border border-calma-line rounded px-2 py-0.5 text-calma-ink text-[11px] focus:outline-none focus:border-calma-accent"
                >
                  <option value="" disabled>
                    Categoría...
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Flag className="w-3 h-3" />
                <select
                  aria-label="Asignar prioridad en masa a las seleccionadas"
                  onChange={(e) => {
                    handleBatchPriority(e.target.value as Priority);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  className="bg-calma-surface border border-calma-line rounded px-2 py-0.5 text-calma-ink text-[11px] focus:outline-none focus:border-calma-accent"
                >
                  <option value="" disabled>
                    Prioridad...
                  </option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 3. Lista scrolleable de eventos */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 divide-y divide-calma-line/40">
          {items.map((item) => {
            const isDescExpanded = expandedDescId === item.uid;

            return (
              <div
                key={item.uid}
                className={`pt-2.5 first:pt-0 rounded-xl transition-colors ${
                  item.selected ? 'bg-calma-surface' : 'opacity-60 bg-calma-bg/40'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleSelect(item.uid)}
                    className="mt-1 text-calma-muted hover:text-calma-ink transition-colors flex-none"
                    aria-label={item.selected ? 'Deseleccionar' : 'Seleccionar'}
                  >
                    {item.selected ? (
                      <CheckSquare className="w-4 h-4 text-calma-accent" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {/* Detalle y campos editables */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Título editable */}
                    <input
                      type="text"
                      value={item.customTitle}
                      onChange={(e) => handleEditTitle(item.uid, e.target.value)}
                      className="w-full text-xs sm:text-[13px] font-medium text-calma-ink bg-transparent border-b border-transparent hover:border-calma-line focus:border-calma-accent focus:bg-calma-bg px-1 py-0.5 rounded transition-all focus:outline-none truncate"
                      placeholder="Título de la tarea"
                    />

                    {/* Metadatos: Fecha, hora, enlaces y advertencia */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-calma-muted px-1">
                      <span className="flex items-center gap-1 font-medium text-calma-ink/90">
                        <Calendar className="w-3 h-3 text-calma-accent" />
                        {formatDateShortSpanish(item.dueDate)}
                      </span>

                      {item.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </span>
                      )}

                      {item.links && item.links.length > 0 && (
                        <span className="flex items-center gap-1 text-calma-accent bg-calma-accent-soft px-1.5 py-0.5 rounded">
                          <LinkIcon className="w-2.5 h-2.5" />
                          {item.links.length} enlace{item.links.length > 1 ? 's' : ''}
                        </span>
                      )}

                      {item.isDuplicate && (
                        <span className="flex items-center gap-1 text-calma-warn bg-calma-warn/10 px-1.5 py-0.5 rounded font-medium">
                          <AlertCircle className="w-3 h-3" />
                          Ya existe
                        </span>
                      )}

                      {item.description && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDescId(isDescExpanded ? null : item.uid)
                          }
                          className="text-[11px] text-calma-muted hover:text-calma-ink flex items-center gap-0.5 ml-auto transition-colors"
                        >
                          <span>{isDescExpanded ? 'Menos' : 'Ver detalle'}</span>
                          {isDescExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Descripción expandible */}
                    {isDescExpanded && item.description && (
                      <div className="mt-1 p-2 bg-calma-bg rounded-lg text-[11px] text-calma-muted whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                        {item.description}
                      </div>
                    )}

                    {/* Selectores de Categoría y Prioridad individuales */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 px-1">
                      {/* Categoría */}
                      <select
                        aria-label="Categoría"
                        value={item.categoryId}
                        onChange={(e) => handleChangeCategory(item.uid, e.target.value)}
                        className="bg-calma-bg border border-calma-line rounded px-2 py-0.5 text-calma-ink text-[11px] focus:outline-none focus:border-calma-accent"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      {/* Prioridad */}
                      <select
                        aria-label="Prioridad"
                        value={item.priority}
                        onChange={(e) =>
                          handleChangePriority(item.uid, e.target.value as Priority)
                        }
                        className={`border rounded px-2 py-0.5 text-[11px] font-medium focus:outline-none ${
                          item.priority === 'alta'
                            ? 'bg-calma-warn/10 border-calma-warn/40 text-calma-warn'
                            : item.priority === 'media'
                            ? 'bg-calma-accent-soft border-calma-accent/40 text-calma-ink'
                            : 'bg-calma-bg border-calma-line text-calma-muted'
                        }`}
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Pie del Modal: Recordatorio periódico y Botones */}
        <div className="p-4 sm:p-5 bg-calma-surface border-t border-calma-line flex-none space-y-3">
          {/* Opción de recordatorio automático */}
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-calma-bg border border-calma-line text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-calma-accent accent-calma-accent cursor-pointer"
              />
              <span className="flex items-center gap-1.5 font-medium text-calma-ink">
                <Bell className="w-3.5 h-3.5 text-calma-accent" />
                Recordarme volver a importar en:
              </span>
            </label>

            <div className="flex items-center gap-1">
              {[30, 45, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={!reminderEnabled}
                  onClick={() => setReminderDays(d)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    reminderDays === d && reminderEnabled
                      ? 'bg-calma-accent text-white'
                      : 'bg-calma-surface border border-calma-line text-calma-muted hover:text-calma-ink disabled:opacity-40'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-calma-muted hover:text-calma-ink hover:bg-calma-bg rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-medium bg-calma-accent text-white rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Añadir {selectedCount} {selectedCount === 1 ? 'tarea' : 'tareas'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
