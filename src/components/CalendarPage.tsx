import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Pin,
} from 'lucide-react';
import { Task, Category, Reminder } from '../types';
import { TaskCard } from './TaskCard';
import {
  getCalendarMonthDays,
  getMonthYearTitle,
  WEEKDAYS_ES,
  getTodayString,
  formatDateLongSpanish,
} from '../lib/dates';

interface CalendarPageProps {
  tasks: Task[];
  categories: Category[];
  reminders?: Reminder[];
  selectedTaskId?: string | null;
  onSelectTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onAddTaskForDate: (title: string, date: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  tasks,
  categories,
  reminders = [],
  selectedTaskId,
  onSelectTask,
  onToggleTask,
  onTogglePin,
  onAddTaskForDate,
}) => {
  const todayStr = getTodayString();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateString, setSelectedDateString] = useState(todayStr);
  const [quickTitle, setQuickTitle] = useState('');

  // Tareas fijadas pendientes (para vista compacta en móvil/tablet)
  const pinnedTasks = useMemo(() => {
    return tasks.filter((t) => t.isPinned && t.status === 'pendiente');
  }, [tasks]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Días a pintar en la cuadrícula mensual
  const monthDays = useMemo(() => {
    return getCalendarMonthDays(year, month);
  }, [year, month]);

  // Mapa de categorías para acceso rápido a sus colores y nombres
  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Mapa de tareas agrupadas por fecha (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (t.dueDate) {
        const list = map.get(t.dueDate) || [];
        list.push(t);
        map.set(t.dueDate, list);
      }
    });
    return map;
  }, [tasks]);

  // Mapa de recordatorios agrupados por fecha
  const remindersByDate = useMemo(() => {
    const map = new Map<string, Reminder[]>();
    reminders.forEach((r) => {
      if (r.dueDate) {
        const list = map.get(r.dueDate) || [];
        list.push(r);
        map.set(r.dueDate, list);
      }
    });
    return map;
  }, [reminders]);

  // Tareas y recordatorios del día seleccionado
  const selectedDayTasks = useMemo(() => {
    return tasksByDate.get(selectedDateString) || [];
  }, [tasksByDate, selectedDateString]);

  const selectedDayReminders = useMemo(() => {
    return remindersByDate.get(selectedDateString) || [];
  }, [remindersByDate, selectedDateString]);

  // Navegación de meses
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateString(getTodayString());
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onAddTaskForDate(quickTitle.trim(), selectedDateString);
    setQuickTitle('');
  };

  const isCurrentMonthViewing =
    new Date().getFullYear() === year && new Date().getMonth() === month;

  return (
    <div className="space-y-6 pb-28">
      {/* 1. Cabecera del Calendario */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 text-calma-muted text-[13px] sm:text-[14px] tracking-wide font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            <img src="/icons/IcoRekayu.ico" alt="Logo Rekayu" className="w-4 h-4 rounded-sm object-contain flex-none" />
            <span className="font-semibold text-calma-ink">Rekayu</span>
            <span className="text-calma-muted/40 font-light">·</span>
            <span className="capitalize">{getMonthYearTitle(year, month)}</span>
          </div>
          <h1 className="font-serif font-normal text-[36px] sm:text-[46px] leading-none tracking-[-0.01em] text-calma-ink m-0">
            Calendario
          </h1>
        </div>

        {/* Controles de navegación de mes */}
        <div className="flex items-center gap-1.5 bg-calma-surface p-1 rounded-full border border-calma-line shadow-xs">
          {!isCurrentMonthViewing && (
            <button
              onClick={handleGoToday}
              className="text-[12px] font-medium px-2.5 py-1 text-calma-accent hover:bg-calma-bg rounded-full transition-colors"
            >
              Hoy
            </button>
          )}
          <button
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
            className="w-8 h-8 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-ink hover:bg-calma-bg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
            className="w-8 h-8 rounded-full flex items-center justify-center text-calma-muted hover:text-calma-ink hover:bg-calma-bg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sección destacada de tareas fijadas en móvil / tablet (igual que en Tareas) */}
      {pinnedTasks.length > 0 && (
        <div className="xl:hidden bg-calma-surface/60 rounded-2xl p-2.5 border border-calma-line/60">
          <div className="flex items-center gap-1.5 px-2 py-1 text-calma-accent text-[12px] font-semibold uppercase tracking-wider mb-1">
            <Pin className="w-3.5 h-3.5" />
            <span>Fijadas ({pinnedTasks.length})</span>
          </div>
          <div className="space-y-1 px-1 py-1">
            {pinnedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                category={categoriesMap.get(task.categoryId)}
                isSelected={selectedTaskId === task.id}
                onSelect={onSelectTask}
                onToggle={onToggleTask}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cuadrícula del Mes y Agenda del día lado a lado en escritorio para eliminar scroll innecesario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
        {/* 2. Cuadrícula Mensual (Columna Izquierda) */}
        <div className="bg-calma-surface rounded-2xl p-4 sm:p-5 border border-calma-line shadow-xs">
        {/* Nombres de los días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {WEEKDAYS_ES.map((dayName, idx) => (
            <div
              key={dayName}
              className={`text-[11.5px] sm:text-[12px] font-medium py-1 ${
                idx >= 5 ? 'text-calma-muted/70' : 'text-calma-muted'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {monthDays.map((day) => {
            const isSelected = day.dateString === selectedDateString;
            const dayTasks = tasksByDate.get(day.dateString) || [];
            const dayReminders = remindersByDate.get(day.dateString) || [];
            const totalItems = dayTasks.length + dayReminders.length;

            return (
              <button
                key={day.dateString}
                onClick={() => setSelectedDateString(day.dateString)}
                className={`relative flex flex-col items-center justify-between min-h-[46px] sm:min-h-[52px] p-1.5 rounded-xl sm:rounded-2xl transition-all duration-150 select-none ${
                  isSelected
                    ? 'bg-calma-accent text-white shadow-xs font-semibold'
                    : day.isToday
                    ? 'bg-calma-bg text-calma-accent font-semibold border border-calma-accent/60'
                    : day.isCurrentMonth
                    ? 'text-calma-ink hover:bg-calma-bg'
                    : 'text-calma-muted/40 hover:text-calma-muted hover:bg-calma-bg/40'
                }`}
              >
                <span className="text-[13px] sm:text-[14px] leading-tight">
                  {day.dayNumber}
                </span>

                {/* Puntos indicadores de categorías de tareas programadas */}
                <div className="flex items-center justify-center gap-1 h-2 mt-0.5">
                  {totalItems > 0 &&
                    dayTasks.slice(0, 3).map((task) => {
                      const category = categoriesMap.get(task.categoryId);
                      const dotColor = isSelected ? '#FFFFFF' : category?.color || '#5F8F80';
                      return (
                        <span
                          key={task.id}
                          className="w-1.5 h-1.5 rounded-full flex-none transition-transform"
                          style={{ backgroundColor: dotColor }}
                        />
                      );
                    })}
                  {dayTasks.length > 3 && (
                    <span
                      className={`text-[9px] leading-none ${
                        isSelected ? 'text-white' : 'text-calma-muted'
                      }`}
                    >
                      +
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Panel de detalle del día seleccionado */}
      <div className="bg-calma-surface rounded-2xl p-5 border border-calma-line shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-calma-line/60 pb-3">
          <div>
            <h2 className="text-[15px] sm:text-[16px] font-medium text-calma-ink m-0 capitalize">
              {formatDateLongSpanish(selectedDateString) || 'Día seleccionado'}
            </h2>
            <p className="text-[12px] sm:text-[13px] text-calma-muted mt-0.5 m-0">
              {selectedDayTasks.length === 0
                ? 'Sin tareas para esta fecha'
                : `${selectedDayTasks.length} ${
                    selectedDayTasks.length === 1 ? 'tarea programada' : 'tareas programadas'
                  }`}
            </p>
          </div>

          {selectedDateString === todayStr && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-calma-accent-soft text-calma-accent">
              Hoy
            </span>
          )}
        </div>

        {/* Input rápido para añadir tarea en este día concreto */}
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder={`Añadir tarea para el ${selectedDateString}`}
            className="flex-1 bg-calma-bg border border-calma-line rounded-xl px-3.5 py-2 text-[13.5px] text-calma-ink placeholder:text-calma-muted focus:outline-none focus:ring-1 focus:ring-calma-accent transition-all"
          />
          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="w-9 h-9 rounded-xl bg-calma-accent text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex-none shadow-xs"
            title="Añadir tarea"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
          </button>
        </form>

        {/* Lista de tareas de este día */}
        {selectedDayTasks.length === 0 && selectedDayReminders.length === 0 ? (
          <div className="py-6 text-center text-calma-muted">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30 text-calma-muted" />
            <p className="text-[13px] font-serif m-0 italic">
              Día despejado. No hay entregas ni tareas pendientes.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {selectedDayTasks.map((task) => {
              const category = categoriesMap.get(task.categoryId);
              const isDone = task.status === 'hecha';
              const isSelected = selectedTaskId === task.id;

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-calma-accent-soft/50 border-calma-accent'
                      : 'bg-calma-bg/60 hover:bg-calma-bg border-calma-line'
                  }`}
                >
                  {/* Checkbox de estado */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className="flex-none text-calma-muted hover:text-calma-accent transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-calma-accent" />
                    ) : (
                      <Circle className="w-4 h-4 text-calma-muted group-hover:text-calma-accent" />
                    )}
                  </button>

                  {/* Título y metadatos */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[13.5px] font-medium m-0 truncate transition-colors ${
                        isDone ? 'line-through text-calma-muted' : 'text-calma-ink'
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      {/* Categoría */}
                      {category && (
                        <span className="flex items-center gap-1 text-[11px] text-calma-muted">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </span>
                      )}

                      {/* Hora si tiene */}
                      {task.time && (
                        <span className="flex items-center gap-1 text-[11px] text-calma-muted">
                          <Clock className="w-3 h-3" />
                          <span>{task.time}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Recordatorios si hubiera */}
            {selectedDayReminders.map((rem) => (
              <div
                key={rem.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-calma-line bg-calma-bg/30 text-[13px] text-calma-muted"
              >
                <span className="w-2 h-2 rounded-full bg-calma-accent" />
                <span className="flex-1 truncate">{rem.title}</span>
                {rem.dueTime && <span>{rem.dueTime}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
