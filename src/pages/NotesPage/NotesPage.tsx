import React, { useState } from 'react';
import { useNotesContext } from '../../context/NotesContext';
import { useProjects } from '../../hooks/useProjects';
import { Note } from '../../types';
import { formatDate } from '../../utils/dateHelpers';
import styles from './NotesPage.module.css';

export function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotesContext();
  const { projects } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState<string>('');
  const [filterProjectId, setFilterProjectId] = useState<string>('');

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const filteredNotes = filterProjectId
    ? notes.filter((n) => n.projectId === filterProjectId)
    : notes;

  const handleAdd = () => {
    if (newTitle.trim()) {
      addNote(newTitle.trim(), '', newProjectId || null);
      setNewTitle('');
      setNewProjectId('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleUpdate = (note: Note, content: string) => {
    updateNote({ ...note, content });
  };

  const handleUpdateTitle = (note: Note, title: string) => {
    updateNote({ ...note, title });
  };

  const handleUpdateProject = (note: Note, projectId: string) => {
    updateNote({ ...note, projectId: projectId || null });
  };

  const getProjectById = (id: string | null) =>
    id ? projects.find((p) => p.id === id) : null;

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.heading}>Заметки</h2>
          {projects.length > 0 && (
            <select
              className={styles.filterSelect}
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              title="Фильтр по проекту"
            >
              <option value="">Все проекты</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className={styles.addRow}>
          <input
            className={styles.addInput}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Новая заметка..."
          />
          <button className={styles.addBtn} onClick={handleAdd}>+</button>
        </div>
        {projects.length > 0 && (
          <select
            className={styles.addProjectSelect}
            value={newProjectId}
            onChange={(e) => setNewProjectId(e.target.value)}
          >
            <option value="">— Без проекта —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
            ))}
          </select>
        )}
        <div className={styles.list}>
          {filteredNotes.length === 0 && (
            <p className={styles.empty}>Нет заметок</p>
          )}
          {filteredNotes.map((note) => {
            const proj = getProjectById(note.projectId ?? null);
            return (
              <div
                key={note.id}
                className={`${styles.noteItem} ${selectedId === note.id ? styles.selected : ''}`}
                onClick={() => setSelectedId(note.id)}
              >
                <div className={styles.noteTitleRow}>
                  <span className={styles.noteTitle}>{note.title || 'Без названия'}</span>
                  {proj && (
                    <span className={styles.noteProjectBadge} title={proj.name}>
                      {proj.icon}
                    </span>
                  )}
                </div>
                <span className={styles.noteDate}>{formatDate(note.updatedAt)}</span>
                <button
                  className={styles.delBtn}
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); if (selectedId === note.id) setSelectedId(null); }}
                  title="Удалить"
                >×</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.editor}>
        {selectedNote ? (
          <>
            <input
              className={styles.editorTitle}
              value={selectedNote.title}
              onChange={(e) => handleUpdateTitle(selectedNote, e.target.value)}
              placeholder="Название заметки"
            />
            {projects.length > 0 && (
              <div className={styles.editorProjectRow}>
                <label className={styles.metaLabel}>Проект:</label>
                <select
                  className={styles.editorProjectSelect}
                  value={selectedNote.projectId ?? ''}
                  onChange={(e) => handleUpdateProject(selectedNote, e.target.value)}
                >
                  <option value="">— Без проекта —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <textarea
              className={styles.editorBody}
              value={selectedNote.content}
              onChange={(e) => handleUpdate(selectedNote, e.target.value)}
              placeholder="Начните писать..."
            />
            <p className={styles.editorMeta}>
              Изменено: {formatDate(selectedNote.updatedAt)}
            </p>
          </>
        ) : (
          <div className={styles.editorPlaceholder}>
            <span>📝</span>
            <p>Выберите заметку или создайте новую</p>
          </div>
        )}
      </div>
    </div>
  );
}

