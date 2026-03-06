import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useNotesContext } from '../../context/NotesContext';
import { TaskList } from '../../components/TaskList/TaskList';
import { TaskDetails } from '../../components/TaskDetails/TaskDetails';
import { Note, Project } from '../../types';
import { formatDate } from '../../utils/dateHelpers';
import styles from './ProjectsPage.module.css';

export function ProjectsPage() {
  const { id } = useParams<{ id: string }>();
  const { selectedTaskId, selectedTask, setSelectedTaskId, addTask, updateTask, deleteTask, toggleTask, getTasksByProject } = useTasks();
  const { projects } = useProjects();
  const { notes, addNote, updateNote, deleteNote } = useNotesContext();

  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const project = projects.find((p) => p.id === id);
  const projectTasks = id ? getTasksByProject(id) : [];
  const projectNotes = notes.filter((n) => n.projectId === id);
  const selectedNote = projectNotes.find((n) => n.id === selectedNoteId) ?? null;

  // Build ancestor breadcrumb path
  const getAncestors = (parentId: string | null): Project[] => {
    if (!parentId) return [];
    const parent = projects.find((p) => p.id === parentId);
    if (!parent) return [];
    return [...getAncestors(parent.parentId), parent];
  };
  const ancestors = project ? getAncestors(project.parentId) : [];

  const handleAddNote = () => {
    if (newNoteTitle.trim()) {
      addNote(newNoteTitle.trim(), '', id ?? null);
      setNewNoteTitle('');
    }
  };

  const handleUpdateNote = (note: Note, field: 'title' | 'content', value: string) => {
    updateNote({ ...note, [field]: value });
  };

  if (!project) {
    return (
      <div className={styles.notFound}>
        <p>Проект не найден</p>
        <Link to="/">← На главную</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>← Назад</Link>
        {ancestors.length > 0 && (
          <div className={styles.breadcrumb}>
            {ancestors.map((p, i) => (
              <React.Fragment key={p.id}>
                {i > 0 && <span className={styles.breadcrumbSep}>›</span>}
                <Link to={`/projects/${p.id}`} className={styles.breadcrumbItem}>
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </Link>
              </React.Fragment>
            ))}
            <span className={styles.breadcrumbSep}>›</span>
          </div>
        )}
        <span className={styles.projectIcon}>{project.icon}</span>
        <h1 className={styles.title}>{project.name}</h1>
        <span className={styles.count}>{projectTasks.length} задач</span>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'tasks' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✓ Задачи
          {projectTasks.length > 0 && <span className={styles.tabBadge}>{projectTasks.length}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'notes' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Заметки
          {projectNotes.length > 0 && <span className={styles.tabBadge}>{projectNotes.length}</span>}
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className={styles.content}>
          <div className={styles.list}>
            <TaskList
              title="Задачи проекта"
              tasks={projectTasks}
              selectedTaskId={selectedTaskId}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onSelect={setSelectedTaskId}
              onAdd={(title) => addTask(title, id ?? null)}
              onUpdate={updateTask}
            />
          </div>
          {selectedTask && selectedTask.projectId === id && (
            <div className={styles.details}>
              <TaskDetails
                task={selectedTask}
                onUpdate={updateTask}
                onClose={() => setSelectedTaskId(null)}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className={styles.notesLayout}>
          <div className={styles.notesSidebar}>
            <div className={styles.notesAddRow}>
              <input
                className={styles.notesAddInput}
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Новая заметка..."
              />
              <button className={styles.notesAddBtn} onClick={handleAddNote}>+</button>
            </div>
            <div className={styles.notesList}>
              {projectNotes.length === 0 && (
                <p className={styles.notesEmpty}>Нет заметок для этого проекта</p>
              )}
              {projectNotes.map((note) => (
                <div
                  key={note.id}
                  className={`${styles.noteItem} ${selectedNoteId === note.id ? styles.noteSelected : ''}`}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <span className={styles.noteTitle}>{note.title || 'Без названия'}</span>
                  <span className={styles.noteDate}>{formatDate(note.updatedAt)}</span>
                  <button
                    className={styles.noteDelBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                      if (selectedNoteId === note.id) setSelectedNoteId(null);
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.notesEditor}>
            {selectedNote ? (
              <>
                <input
                  className={styles.noteEditorTitle}
                  value={selectedNote.title}
                  onChange={(e) => handleUpdateNote(selectedNote, 'title', e.target.value)}
                  placeholder="Название заметки"
                />
                <textarea
                  className={styles.noteEditorBody}
                  value={selectedNote.content}
                  onChange={(e) => handleUpdateNote(selectedNote, 'content', e.target.value)}
                  placeholder="Начните писать..."
                />
                <p className={styles.noteEditorMeta}>Изменено: {formatDate(selectedNote.updatedAt)}</p>
              </>
            ) : (
              <div className={styles.notesPlaceholder}>
                <span>📝</span>
                <p>Выберите заметку или создайте новую</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
