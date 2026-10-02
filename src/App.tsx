import React, { useState, useMemo } from 'react';
import { ViewType, SectionType, Task, Reminder } from './types';
import { useDarkMode } from './hooks/useDarkMode';
import { useTasks } from './hooks/useTasks';
import { useCategories } from './hooks/useCategories';
import { useNotes } from './hooks/useNotes';
import { useReminders } from './hooks/useReminders';
import { isOverdue, isToday, getDaysRemaining, getTodayString } from './lib/dates';

import { Header } from './components/Header';
import { ExamsBanner } from './components/ExamsBanner';
import { ViewTabs } from './components/ViewTabs';
import { CategoryFilter } from './components/CategoryFilter';
import { TaskList } from './components/TaskList';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { ReminderDetailPanel } from './components/ReminderDetailPanel';
import { PinnedTasksRail } from './components/PinnedTasksRail';
import { AddBar } from './components/AddBar';
import { RemindersSection } from './components/RemindersSection';
import { NotesSection } from './components/NotesSection';
import { CategoryModal } from './components/CategoryModal';
import { DataBackupModal } from './components/DataBackupModal';

export const App: React.FC = () => {
  const { isDark, toggleDarkMode } = useDarkMode();
  const {
    tasks,
    addTask,
    updateTask,
    toggleTaskStatus,
    togglePinTask,
    deleteTask,
    refreshTasks,
  } = useTasks();
  const { categories, addCategory, refreshCategories } = useCategories();
  const { notes, addNote, updateNote, togglePinNote, deleteNote, refreshNotes } = useNotes();
  const {
    reminders,
    addReminder,
    updateReminder,
    toggleReminder,
    deleteReminder,
    refreshReminders,
  } = useReminders();

  // Sección activa (Tareas, Recordatorios, Notas)
  const [activeSection, setActiveSection] = useState<SectionType>('tareas');

  // Sub-vista de tareas (Hoy, Próximos, Hechas)
  const [activeView, setActiveView] = useState<ViewType>('hoy');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Tarea o recordatorio seleccionado para el panel lateral
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  // Modales
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const isPanelOpen = !!selectedTask || !!selectedReminder;

  // Contadores para pestañas y resumen
  const counts = useMemo(() => {
    let hoy = 0;
    let proximos = 0;
    let todas = 0;
    let hechas = 0;
    let pendingTasks = 0;

    tasks.forEach((t) => {
      if (t.status === 'hecha') {
        hechas++;
      } else {
        todas++;
        pendingTasks++;
        if (t.dueDate) {
          if (isOverdue(t.dueDate) || isToday(t.dueDate)) {
            hoy++;
          } else if (getDaysRemaining(t.dueDate) > 0) {
            proximos++;
          }
        } else {
          hoy++;
        }
      }
    });

    const pendingReminders = reminders.filter((r) => !r.isCompleted).length;
    const notesCount = notes.length;

    return {
      hoy,
      proximos,
      todas,
      hechas,
      pendingTasks,
      pendingReminders,
      notesCount,
    };
  }, [tasks, reminders, notes]);

  // Manejador de añadido rápido desde la barra inferior
  const handleQuickAddTask = (title: string) => {
    const defaultCatId = selectedCategoryId || (categories[0]?.id ?? 'cat-personal');
    const created = addTask({
      title,
      priority: 'media',
      categoryId: defaultCatId,
      dueDate: getTodayString(),
    });
    setActiveView('hoy');
    setSelectedReminder(null);
    setSelectedTask(created);
  };

  const handleUpdateTask = (updated: Task) => {
    updateTask(updated);
    if (selectedTask?.id === updated.id) {
      setSelectedTask(updated);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
  };

  const handleToggleTask = (id: string) => {
    toggleTaskStatus(id);
    if (selectedTask?.id === id) {
      setSelectedTask((prev) =>
        prev ? { ...prev, status: prev.status === 'pendiente' ? 'hecha' : 'pendiente' } : null
      );
    }
  };

  // Sincronización al restaurar copia de seguridad
  const handleDataRestored = () => {
    refreshTasks();
    refreshCategories();
    refreshNotes();
    refreshReminders();
    setSelectedTask(null);
    setSelectedReminder(null);
  };

  return (
    <div
      className={`h-screen h-[100dvh] overflow-hidden bg-calma-bg text-calma-ink font-sans flex flex-col transition-all duration-350 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
        isPanelOpen ? 'lg:pr-[480px]' : ''
      }`}
    >
      {/* Panel fijo lateral izquierdo de tareas fijadas (se oculta cuando hay un panel abierto para mantener equilibrio visual) */}
      {activeSection === 'tareas' && !isPanelOpen && (
        <PinnedTasksRail
          tasks={tasks}
          categories={categories}
          selectedTaskId={null}
          onSelectTask={(task) => {
            setSelectedReminder(null);
            setSelectedTask(task);
          }}
          onToggleTask={handleToggleTask}
          onTogglePin={togglePinTask}
        />
      )}

      {/* Contenedor centrado max-w-[560px] */}
      <div className="w-full max-w-[560px] mx-auto h-full flex flex-col px-6 pt-5 sm:pt-8 min-h-0">
        {/* 1. Cabecera y controles superiores fijos (sin scroll) */}
        <div className="flex-none">
          <Header
            activeSection={activeSection}
            onChangeSection={(sec) => {
              setActiveSection(sec);
              setSelectedTask(null);
              setSelectedReminder(null);
            }}
            activeView={activeView}
            pendingTasksCount={counts.pendingTasks}
            pendingRemindersCount={counts.pendingReminders}
            notesCount={counts.notesCount}
            isDark={isDark}
            onToggleDarkMode={toggleDarkMode}
            onOpenBackup={() => setIsBackupModalOpen(true)}
          />

          {activeSection === 'tareas' && (
            <>
              {/* Pestañas de Vista (Hoy, Próximos, Hechas) */}
              <ViewTabs
                activeView={activeView}
                onChangeView={setActiveView}
                counts={counts}
              />

              {/* Filtro deslizante de Categorías */}
              <CategoryFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onOpenNewCategory={() => setIsCategoryModalOpen(true)}
              />
            </>
          )}
        </div>

        {/* 2. Área scrolleable interna (Solo esta sección hace scroll) */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-32 overscroll-contain px-1">
          {/* Sección: Tareas */}
          {activeSection === 'tareas' && (
            <div className="space-y-0">
              {/* Widget de Fechas Clave / Exámenes (solo en vista Hoy) */}
              {activeView === 'hoy' && (
                <ExamsBanner
                  tasks={tasks}
                  categories={categories}
                  selectedTaskId={selectedTask?.id}
                  onSelectTask={(task) => {
                    setSelectedReminder(null);
                    setSelectedTask(task);
                  }}
                  onToggleTask={handleToggleTask}
                />
              )}

              {/* Lista minimalista de tareas */}
              <TaskList
                tasks={tasks}
                categories={categories}
                activeView={activeView}
                selectedCategoryId={selectedCategoryId}
                selectedTaskId={selectedTask?.id}
                onSelectTask={(task) => {
                  setSelectedReminder(null);
                  setSelectedTask(task);
                }}
                onToggleTask={handleToggleTask}
                onTogglePin={togglePinTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}

          {/* Sección: Recordatorios */}
          {activeSection === 'recordatorios' && (
            <div className="mt-4">
              <RemindersSection
                reminders={reminders}
                selectedReminderId={selectedReminder?.id}
                onSelectReminder={(r) => {
                  setSelectedTask(null);
                  setSelectedReminder(r);
                }}
                onAddReminder={addReminder}
                onToggleReminder={toggleReminder}
                onDeleteReminder={deleteReminder}
              />
            </div>
          )}

          {/* Sección: Notas */}
          {activeSection === 'notas' && (
            <div className="mt-4">
              <NotesSection
                notes={notes}
                onAddNote={addNote}
                onUpdateNote={updateNote}
                onTogglePin={togglePinNote}
                onDeleteNote={deleteNote}
              />
            </div>
          )}
        </div>
      </div>

      {/* Barra flotante inferior de añadir tarea (solo en sección de tareas) */}
      {activeSection === 'tareas' && (
        <AddBar
          onAddTask={handleQuickAddTask}
          hasPanelOpen={isPanelOpen}
        />
      )}

      {/* Panel lateral de detalle de tarea ("La nota") */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          categories={categories}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onToggleStatus={handleToggleTask}
        />
      )}

      {/* Panel lateral de detalle de recordatorio */}
      {selectedReminder && (
        <ReminderDetailPanel
          reminder={selectedReminder}
          onClose={() => setSelectedReminder(null)}
          onUpdateReminder={(updated) => {
            updateReminder(updated);
            setSelectedReminder(updated);
          }}
          onDeleteReminder={(id) => {
            deleteReminder(id);
            if (selectedReminder?.id === id) setSelectedReminder(null);
          }}
          onToggleStatus={(id) => {
            toggleReminder(id);
            setSelectedReminder((prev) =>
              prev ? { ...prev, isCompleted: !prev.isCompleted } : null
            );
          }}
        />
      )}

      {/* Modal para crear categoría */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={addCategory}
      />

      {/* Modal para Copia de Seguridad JSON */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={handleDataRestored}
      />
    </div>
  );
};

export default App;
