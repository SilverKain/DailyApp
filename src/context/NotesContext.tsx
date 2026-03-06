import React, { createContext, useContext, useEffect, useState } from 'react';
import { Note } from '../types';
import { storageService } from '../services/storageService';
import { generateId } from '../utils/generateId';

interface NotesContextValue {
  notes: Note[];
  addNote: (title: string, content: string, projectId?: string | null) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(() => storageService.loadNotes());

  useEffect(() => {
    storageService.saveNotes(notes);
  }, [notes]);

  const addNote = (title: string, content: string, projectId: string | null = null) => {
    const note: Note = {
      id: generateId(),
      title,
      content,
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
  };

  const updateNote = (updated: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : n))
    );
  };

  const deleteNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotesContext() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotesContext must be used within NotesProvider');
  return ctx;
}
