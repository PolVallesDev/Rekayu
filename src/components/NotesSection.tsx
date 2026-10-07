import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, Pin, Trash2, Edit3, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

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
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
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
    <div className="space-y-6">
      {/* Botón para crear nueva nota */}
      <div className="flex justify-end">
        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-calma-accent text-white hover:opacity-90 rounded-full text-[14px] font-medium shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Nueva nota</span>
        </button>
      </div>

      {/* Grid de notas fijadas */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[12px] font-medium text-calma-muted uppercase tracking-wider flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-calma-accent" />
            Fijadas ({pinnedNotes.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => handleStartEdit(note)}
                onTogglePin={() => onTogglePin(note.id)}
                onDelete={() => setNoteToDelete(note)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid de resto de notas */}
      <div className="space-y-2.5">
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <span className="text-[12px] font-medium text-calma-muted uppercase tracking-wider block">
            Otras notas
          </span>
        )}
        {notes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-calma-line rounded-2xl">
            <p className="text-[14px] text-calma-muted mb-2 m-0">No tienes notas todavía.</p>
            <button
              onClick={handleStartCreate}
              className="text-[14px] font-medium text-calma-accent hover:underline mt-1"
            >
              Crear tu primera anotación
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => handleStartEdit(note)}
                onTogglePin={() => onTogglePin(note.id)}
                onDelete={() => setNoteToDelete(note)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para Crear o Editar Nota */}
      {(isCreating || editingNote) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-calma-surface rounded-2xl p-5 shadow-2xl border border-calma-line space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-calma-line">
              <h3 className="text-base font-serif font-normal text-calma-ink">
                {editingNote ? 'Editar nota' : 'Nueva nota'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingNote(null);
                }}
                className="p-1.5 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg"
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
                  placeholder="Título de la nota…"
                  className="w-full px-3.5 py-2.5 text-[15px] bg-calma-bg border-0 rounded-xl text-calma-ink placeholder:text-calma-muted focus:outline-none focus:ring-2 focus:ring-calma-accent"
                />
              </div>

              <div>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe lo que tengas en mente…"
                  className="w-full px-3.5 py-3 text-[14.5px] bg-calma-bg border-0 rounded-xl text-calma-ink placeholder:text-calma-muted focus:outline-none focus:ring-2 focus:ring-calma-accent resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-calma-line">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingNote(null);
                  }}
                  className="px-4 py-2 text-[14px] text-calma-muted hover:text-calma-ink rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-calma-accent text-white rounded-xl text-[14px] font-medium hover:opacity-90 transition-opacity"
                >
                  Guardar nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar nota */}
      <ConfirmModal
        isOpen={!!noteToDelete}
        title="Eliminar nota"
        message={
          noteToDelete
            ? `¿Estás seguro de que deseas eliminar «${noteToDelete.title}»? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmText="Eliminar"
        cancelText="Conservar"
        isDanger={true}
        onConfirm={() => {
          if (noteToDelete) {
            onDeleteNote(noteToDelete.id);
          }
          setNoteToDelete(null);
        }}
        onClose={() => setNoteToDelete(null)}
      />
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
    className="group relative p-4 rounded-2xl border border-calma-line/60 bg-calma-surface hover:border-calma-line transition-all cursor-pointer flex flex-col justify-between min-h-[140px] shadow-calma"
  >
    <div>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-[15px] font-medium text-calma-ink line-clamp-1 m-0">
          {note.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded-md transition-colors ${
            note.isPinned
              ? 'text-calma-accent bg-calma-accent-soft'
              : 'text-calma-muted hover:text-calma-ink'
          }`}
          title={note.isPinned ? 'Desfijar nota' : 'Fijar nota arriba'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[13.5px] text-calma-muted line-clamp-4 whitespace-pre-wrap leading-relaxed m-0">
        {note.content || <span className="italic text-calma-muted/60">Sin contenido...</span>}
      </p>
    </div>

    <div className="flex items-center justify-between pt-3 mt-3 border-t border-calma-line text-[11px] text-calma-muted">
      <span>{new Date(note.updatedAt).toLocaleDateString('es-ES')}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 hover:text-calma-accent transition-colors cursor-pointer"
          title="Editar"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:text-calma-warn transition-colors cursor-pointer"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);
