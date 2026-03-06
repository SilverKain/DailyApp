import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Task } from '../../types';
import { useProjects } from '../../hooks/useProjects';
import styles from './TaskModal.module.css';

interface Props {
  task: Task;
  onUpdate: (task: Task) => void;
  onClose: () => void;
}

export function TaskModal({ task, onUpdate, onClose }: Props) {
  const { projects } = useProjects();
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');
  const [projectId, setProjectId] = useState(task.projectId ?? '');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    onUpdate({ ...task, dueDate: dueDate || null, projectId: projectId || null });
    onClose();
  };

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.taskTitle}>{task.title}</span>
          <button className={styles.closeBtn} onClick={onClose} title="Закрыть">×</button>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Срок выполнения</label>
            <div className={styles.dateRow}>
              <input
                className={styles.dateInput}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {dueDate && (
                <button
                  className={styles.clearDate}
                  onClick={() => setDueDate('')}
                  title="Сбросить дату"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {projects.length > 0 && (
            <div className={styles.section}>
              <label className={styles.sectionLabel}>Проект</label>
              <select
                className={styles.select}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">— Без проекта —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Отмена</button>
          <button className={styles.saveBtn} onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
