import React, { createContext, useContext, useEffect, useState } from 'react';
import { Note } from '../types';
import { generateId } from '../utils/generateId';
import { useAuth } from './AuthContext';
import { subscribeToNotes, saveNote, deleteNoteById } from '../services/firestoreService';
import { localStorageProvider } from '../services/localStorageProvider';

interface NotesContextValue {
  notes: Note[];
  loading: boolean;
  addNote: (title: string, content: string, projectId?: string | null) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setNotes(localStorageProvider.loadNotes());
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToNotes(uid, (data) => {
      setNotes(data);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const addNote = (title: string, content: string, projectId: string | null = null) => {
    const note: Note = {
      id: generateId(),
      title,
      content,
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!uid) {
      setNotes((prev) => { const next = [note, ...prev]; localStorageProvider.saveNotes(next); return next; });
    } else {
      saveNote(uid, note);
    }
  };

  const updateNote = (updated: Note) => {
    const withTime = { ...updated, updatedAt: new Date().toISOString() };
    if (!uid) {
      setNotes((prev) => { const next = prev.map((n) => n.id === updated.id ? withTime : n); localStorageProvider.saveNotes(next); return next; });
    } else {
      saveNote(uid, withTime);
    }
  };

  const deleteNote = (id: string) => {
    if (!uid) {
      setNotes((prev) => { const next = prev.filter((n) => n.id !== id); localStorageProvider.saveNotes(next); return next; });
    } else {
      deleteNoteById(uid, id);
    }
  };

  return (
    <NotesContext.Provider value={{ notes, loading, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotesContext() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotesContext must be used within NotesProvider');
  return ctx;
}

