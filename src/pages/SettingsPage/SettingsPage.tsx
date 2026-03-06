import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { useNotesContext } from '../../context/NotesContext';
import { exportToJSON, importFromJSON } from '../../utils/jsonHelpers';
import { storageService } from '../../services/storageService';
import { Project, Task } from '../../types';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { tasks, deleteTask, deleteTasksByProjectIds } = useTaskContext();
  const { projects, deleteProjects } = useProjectContext();
  const { notes } = useNotesContext();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'project' | 'task'; id: string; label: string } | null>(null);
  const [taskSearch, setTaskSearch] = useState('');
  const [schemaExpanded, setSchemaExpanded] = useState<Set<string>>(new Set());

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // --- cascade delete helpers ---
  const collectDescendantIds = (projectId: string): string[] => {
    const children = projects.filter((p) => p.parentId === projectId);
    return [projectId, ...children.flatMap((c) => collectDescendantIds(c.id))];
  };

  const handleDeleteProject = (id: string) => {
    const ids = collectDescendantIds(id);
    deleteTasksByProjectIds(ids);
    deleteProjects(ids);
    setConfirmDelete(null);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setConfirmDelete(null);
  };

  // --- project tree helpers ---
  const topLevel = projects.filter((p) => !p.parentId);

  const getProject = (id: string) => projects.find((p) => p.id === id);
  const getTaskCount = (projectId: string) => tasks.filter((t) => t.projectId === projectId).length;
  const getChildCount = (projectId: string) => projects.filter((p) => p.parentId === projectId).length;

  const getAncestors = (p: Project): Project[] => {
    if (!p.parentId) return [];
    const parent = getProject(p.parentId);
    if (!parent) return [];
    return [...getAncestors(parent), parent];
  };

  const toggleSchema = (id: string) => {
    setSchemaExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderSchemaNode = (p: Project, depth = 0): React.ReactNode => {
    const children = projects.filter((c) => c.parentId === p.id);
    const hasChildren = children.length > 0;
    const expanded = schemaExpanded.has(p.id);
    const taskCount = getTaskCount(p.id);

    return (
      <div key={p.id} className={styles.schemaNode}>
        <div className={styles.schemaRow} style={{ paddingLeft: `${depth * 18}px` }}>
          {hasChildren ? (
            <button className={styles.schemaToggle} onClick={() => toggleSchema(p.id)}>
              {expanded ? '▾' : '▸'}
            </button>
          ) : (
            <span className={styles.schemaToggleSpacer} />
          )}
          <span className={styles.schemaIcon}>{p.icon}</span>
          <button
            className={styles.schemaName}
            onClick={() => navigate(`/projects/${p.id}`)}
            title="Перейти к проекту"
          >
            {p.name}
          </button>
          <span className={styles.schemaMeta}>
            {taskCount > 0 && <span className={styles.schemaTaskBadge}>{taskCount} задач</span>}
            {hasChildren && <span className={styles.schemaChildBadge}>{children.length} подпроект{children.length === 1 ? '' : 'ов'}</span>}
          </span>
          <div className={styles.schemaActions}>
            <button
              className={styles.schemaGoBtn}
              onClick={() => navigate(`/projects/${p.id}`)}
              title="Открыть"
            >
              →
            </button>
            <button
              className={styles.schemaDelBtn}
              onClick={() => setConfirmDelete({ type: 'project', id: p.id, label: p.name })}
              title="Удалить"
            >
              🗑
            </button>
          </div>
        </div>
        {hasChildren && expanded && children.map((c) => renderSchemaNode(c, depth + 1))}
      </div>
    );
  };

  // --- task list ---
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(taskSearch.toLowerCase())
  );

  const getProjectPath = (t: Task): string => {
    if (!t.projectId) return 'Входящие';
    const p = getProject(t.projectId);
    if (!p) return 'Удалённый проект';
    const ancestors = getAncestors(p);
    return [...ancestors, p].map((a) => `${a.icon} ${a.name}`).join(' › ');
  };

  // --- export / import ---
  const handleExport = () => {
    exportToJSON(tasks, projects, notes);
    showMsg('Данные экспортированы в tasks-backup.json', 'success');
  };

  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importFromJSON(
      file,
      (data) => {
        storageService.saveTasks(data.tasks);
        storageService.saveProjects(data.projects);
        if (data.notes) storageService.saveNotes(data.notes);
        showMsg(`Импортировано ${data.tasks.length} задач, ${data.projects.length} проектов. Страница обновится...`, 'success');
        setTimeout(() => window.location.reload(), 1500);
      },
      (msg) => showMsg(msg, 'error')
    );
    e.target.value = '';
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Настройки</h1>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p className={styles.modalText}>
              Удалить <strong>{confirmDelete.label}</strong>?
              {confirmDelete.type === 'project' && (
                <span className={styles.modalWarn}> Все подпроекты и их задачи будут удалены.</span>
              )}
            </p>
            <div className={styles.modalActions}>
              <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() =>
                confirmDelete.type === 'project'
                  ? handleDeleteProject(confirmDelete.id)
                  : handleDeleteTask(confirmDelete.id)
              }>
                Удалить
              </button>
              <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={() => setConfirmDelete(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appearance */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Внешний вид</h2>
        <div className={styles.row}>
          <div className={styles.info}>
            <span className={styles.label}>Тема</span>
            <span className={styles.desc}>{theme === 'light' ? 'Светлая тема активна' : 'Тёмная тема активна'}</span>
          </div>
          <button className={styles.toggleBtn} onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Тёмная' : '☀️ Светлая'}
          </button>
        </div>
      </section>

      {/* Project schema */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Схема проектов</h2>
        {projects.length === 0 ? (
          <p className={styles.emptyHint}>Нет проектов</p>
        ) : (
          <div className={styles.schemaTree}>
            {topLevel.map((p) => renderSchemaNode(p, 0))}
          </div>
        )}
        {projects.length > 0 && (
          <p className={styles.schemaHint}>
            Нажмите ▸ чтобы раскрыть подпроекты · → чтобы открыть · 🗑 чтобы удалить (с подпроектами и задачами)
          </p>
        )}
      </section>

      {/* All tasks */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Все задачи ({tasks.length})</h2>
        <input
          className={styles.searchInput}
          placeholder="Поиск задач..."
          value={taskSearch}
          onChange={(e) => setTaskSearch(e.target.value)}
        />
        <div className={styles.taskMgmtList}>
          {filteredTasks.length === 0 ? (
            <p className={styles.emptyHint}>Нет задач</p>
          ) : (
            filteredTasks.map((t) => {
              const proj = t.projectId ? getProject(t.projectId) : null;
              return (
                <div key={t.id} className={styles.taskMgmtRow}>
                  <span className={`${styles.taskCheck} ${t.completed ? styles.taskDone : ''}`}>
                    {t.completed ? '✓' : '○'}
                  </span>
                  <div className={styles.taskMgmtInfo}>
                    <span className={`${styles.taskMgmtTitle} ${t.completed ? styles.taskDoneText : ''}`}>
                      {t.title}
                    </span>
                    <span className={styles.taskMgmtPath}>{getProjectPath(t)}</span>
                  </div>
                  <div className={styles.taskMgmtActions}>
                    {proj && (
                      <button
                        className={styles.schemaGoBtn}
                        onClick={() => navigate(`/projects/${proj.id}`)}
                        title="Открыть проект"
                      >
                        →
                      </button>
                    )}
                    <button
                      className={styles.schemaDelBtn}
                      onClick={() => setConfirmDelete({ type: 'task', id: t.id, label: t.title })}
                      title="Удалить задачу"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Data */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Данные</h2>
        <div className={styles.row}>
          <div className={styles.info}>
            <span className={styles.label}>Экспорт JSON</span>
            <span className={styles.desc}>
              Скачать файл tasks-backup.json ({tasks.length} задач, {projects.length} проектов, {notes.length} заметок)
            </span>
          </div>
          <button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleExport}>
            ↓ Экспорт JSON
          </button>
        </div>
        <div className={styles.row}>
          <div className={styles.info}>
            <span className={styles.label}>Импорт JSON</span>
            <span className={styles.desc}>Загрузить данные из файла tasks-backup.json</span>
          </div>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={handleImport}>
            ↑ Импорт JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </section>

      {/* Stats */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Статистика</h2>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{tasks.length}</span>
            <span className={styles.statLabel}>Задач всего</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{tasks.filter((t) => t.completed).length}</span>
            <span className={styles.statLabel}>Выполнено</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{projects.length}</span>
            <span className={styles.statLabel}>Проектов</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{notes.length}</span>
            <span className={styles.statLabel}>Заметок</span>
          </div>
        </div>
      </section>
    </div>
  );
}
