import React, { useState, useMemo } from 'react';
import { ViewType, SectionType, Task } from './types';
import { useDarkMode } from './hooks/useDarkMode';
import { useTasks, CreateTaskInput } from './hooks/useTasks';
import { useCategories } from './hooks/useCategories';
import { useNotes } from './hooks/useNotes';
import { useReminders } from './hooks/useReminders';
import { isOverdue, isToday, getDaysRemaining } from './lib/dates';

import { Sidebar } from './components/Sidebar';
import { ExamsBanner } from './components/ExamsBanner';
import { ViewTabs } from './components/ViewTabs';
import { CategoryFilter } from './components/CategoryFilter';
import { TaskList } from './components/TaskList';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { RemindersSection } from './components/RemindersSection';
import { NotesSection } from './components/NotesSection';
import { TaskModal } from './components/TaskModal';
import { CategoryModal } from './components/CategoryModal';
import { DataBackupModal } from './components/DataBackupModal';
import { Plus } from 'lucide-react';

export const App: React.FC = () => {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { tasks, addTask, updateTask, toggleTaskStatus, deleteTask, refreshTasks } = useTasks();
  const { categories, addCategory, refreshCategories } = useCategories();
  const { notes, addNote, updateNote, togglePinNote, deleteNote, refreshNotes } = useNotes();
  const {
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    refreshReminders,
  } = useReminders();

  // Sección activa (Tareas & Entregas, Recordatorios, Notas)
  const [activeSection, setActiveSection] = useState<SectionType>('tareas');

  // Sub-vista de tareas
  const [activeView, setActiveView] = useState<ViewType>('hoy');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Tarea actualmente seleccionada para ver en el panel derecho
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Modales
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Contadores para pestañas y sidebar
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

  // Manejadores de tareas
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskInput: CreateTaskInput | Task) => {
    if ('id' in taskInput) {
      updateTask(taskInput as Task);
      if (selectedTask?.id === taskInput.id) {
        setSelectedTask(taskInput as Task);
      }
    } else {
      const created = addTask(taskInput as CreateTaskInput);
      setSelectedTask(created);
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
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans transition-colors">
      {/* Navegación lateral (Desktop) / Barra superior (Móvil) */}
      <Sidebar
        activeSection={activeSection}
        onChangeSection={(sec) => {
          setActiveSection(sec);
          setSelectedTask(null);
        }}
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        counts={{
          pendingTasks: counts.pendingTasks,
          pendingReminders: counts.pendingReminders,
          notesCount: counts.notesCount,
        }}
      />

      {/* Área central principal (aprovecha todo el ancho) */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeSection === 'tareas' && (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Cabecera de la sección de tareas */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Tareas & Entregas
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Organiza tus materias, proyectos y compromisos diarios.
                </p>
              </div>

              <button
                onClick={handleOpenCreateTask}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva tarea</span>
              </button>
            </div>

            {/* Banner destacado de Exámenes / Entregas */}
            <ExamsBanner
              tasks={tasks}
              categories={categories}
              selectedTaskId={selectedTask?.id}
              onSelectTask={(task) => setSelectedTask(task)}
              onToggleTask={handleToggleTask}
            />

            {/* Pestañas de Vista (Hoy, Próximos, Todas, Hechas) */}
            <ViewTabs
              activeView={activeView}
              onChangeView={setActiveView}
              counts={counts}
            />

            {/* Filtro por Categorías */}
            <CategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              onOpenNewCategory={() => setIsCategoryModalOpen(true)}
            />

            {/* Lista de Tareas */}
            <TaskList
              tasks={tasks}
              categories={categories}
              activeView={activeView}
              selectedCategoryId={selectedCategoryId}
              selectedTaskId={selectedTask?.id}
              onSelectTask={(task) => setSelectedTask(task)}
              onToggleTask={handleToggleTask}
              onEditTask={handleOpenEditTask}
              onDeleteTask={handleDeleteTask}
              onOpenNewTask={handleOpenCreateTask}
            />
          </div>
        )}

        {activeSection === 'recordatorios' && (
          <RemindersSection
            reminders={reminders}
            onAddReminder={addReminder}
            onToggleReminder={toggleReminder}
            onDeleteReminder={deleteReminder}
          />
        )}

        {activeSection === 'notas' && (
          <NotesSection
            notes={notes}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onTogglePin={togglePinNote}
            onDeleteNote={deleteNote}
          />
        )}
      </main>

      {/* Panel lateral derecho de detalles de la tarea */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          category={categories.find((c) => c.id === selectedTask.categoryId)}
          onClose={() => setSelectedTask(null)}
          onToggleStatus={handleToggleTask}
          onEdit={handleOpenEditTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Botón flotante para móvil (solo en tareas) */}
      {activeSection === 'tareas' && (
        <button
          onClick={handleOpenCreateTask}
          className="sm:hidden fixed right-5 bottom-6 z-40 flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-lg transition-transform active:scale-95"
          aria-label="Añadir nueva tarea"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="text-xs font-bold">Tarea</span>
        </button>
      )}

      {/* Modales */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        categories={categories}
        initialTask={editingTask}
        onSave={handleSaveTask}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={addCategory}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={handleDataRestored}
      />
    </div>
  );
};

export default App;
