import { useState, useCallback } from 'react';
import { Note } from '../types';
import { getNotes, saveNotes, deleteRemoteNote } from '../lib/storage';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>(() => getNotes());

  const addNote = useCallback(
    (title: string, content: string) => {
      const now = new Date().toISOString();
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: title.trim() || 'Nota sin título',
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
        isPinned: false,
      };

      const updated = [newNote, ...notes];
      saveNotes(updated);
      setNotes(updated);
      return newNote;
    },
    [notes]
  );

  const updateNote = useCallback(
    (updatedNote: Note) => {
      const now = new Date().toISOString();
      const updated = notes.map((n) =>
        n.id === updatedNote.id ? { ...updatedNote, updatedAt: now } : n
      );
      saveNotes(updated);
      setNotes(updated);
    },
    [notes]
  );

  const togglePinNote = useCallback(
    (id: string) => {
      const updated = notes.map((n) =>
        n.id === id ? { ...n, isPinned: !n.isPinned } : n
      );
      saveNotes(updated);
      setNotes(updated);
    },
    [notes]
  );

  const deleteNote = useCallback(
    (id: string) => {
      const updated = notes.filter((n) => n.id !== id);
      saveNotes(updated);
      setNotes(updated);
      deleteRemoteNote(id);
    },
    [notes]
  );

  const refreshNotes = useCallback(() => {
    setNotes(getNotes());
  }, []);

  return {
    notes,
    addNote,
    updateNote,
    togglePinNote,
    deleteNote,
    refreshNotes,
  };
};
