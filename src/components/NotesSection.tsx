import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, Pin, Trash2, Edit3, FileText, X } from 'lucide-react';

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (title: string, content: string) => void;
  onUpdateNote: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onTogglePin,
  onDeleteNote,
}) => {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleStartCreate = () => {
    setTitle('');
    setContent('');
    setIsCreating(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      setIsCreating(false);
      return;
    }
    onAddNote(title.trim() || 'Nota sin título', content.trim());
    setIsCreating(false);
  };

  const handleStartEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    onUpdateNote({
      ...editingNote,
      title: title.trim() || 'Nota sin título',
      content: content.trim(),
    });
    setEditingNote(null);
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const otherNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Notas & Anotaciones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Apuntes rápidos, ideas para el proyecto o resúmenes de estudio.
          </p>
        </div>
        <button
          onClick={handleStartCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-lg text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva nota</span>
        </button>
      </div>

      {/* Grid de notas fijadas */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Pin className="w-3 h-3 text-indigo-500" />
            Fijadas ({pinnedNotes.length})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => handleStartEdit(note)}
                onTogglePin={() => onTogglePin(note.id)}
                onDelete={() => onDeleteNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid de resto de notas */}
      <div className="space-y-2.5">
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Otras notas
          </span>
        )}
        {notes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-900/30">
            <p className="text-xs text-slate-400 mb-2">No tienes notas todavía.</p>
            <button
              onClick={handleStartCreate}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Crear tu primera anotación
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => handleStartEdit(note)}
                onTogglePin={() => onTogglePin(note.id)}
                onDelete={() => onDeleteNote(note.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para Crear o Editar Nota */}
      {(isCreating || editingNote) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingNote ? 'Editar nota' : 'Nueva nota'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingNote(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={editingNote ? handleSaveEdit : handleSaveCreate}
              className="space-y-3"
            >
              <div>
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la nota..."
                  className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe lo que tengas en mente..."
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingNote(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Guardar nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Tarjeta individual de nota
const NoteCard: React.FC<{
  note: Note;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}> = ({ note, onEdit, onTogglePin, onDelete }) => (
  <div
    onClick={onEdit}
    className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] shadow-xs"
  >
    <div>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
          {note.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded-md transition-colors ${
            note.isPinned
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          title={note.isPinned ? 'Desfijar nota' : 'Fijar nota arriba'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-4 whitespace-pre-wrap leading-relaxed">
        {note.content || <span className="italic text-slate-400">Sin contenido...</span>}
      </p>
    </div>

    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
      <span>{new Date(note.updatedAt).toLocaleDateString('es-ES')}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="Editar"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar la nota "${note.title}"?`)) {
              onDelete();
            }
          }}
          className="p-1 hover:text-rose-500 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
);
