import React, { useState } from 'react';
import { Task } from '../../types';
import { formatDate } from '../../utils/dateHelpers';
import { TaskModal } from '../TaskModal/TaskModal';
import { useProjects } from '../../hooks/useProjects';
import styles from './TaskItem.module.css';

interface Props {
  task: Task;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onUpdate: (task: Task) => void;
  onMoveToToday?: (id: string) => void;
  onMoveToProject?: (id: string, projectId: string) => void;
}

export function TaskItem({ task, isSelected, onToggle, onDelete, onSelect, onUpdate, onMoveToToday, onMoveToProject }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const { projects } = useProjects();

  const allProjects = projects; // includes sub-projects

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    if (pid && onMoveToProject) {
      onMoveToProject(task.id, pid);
      setShowProjectPicker(false);
    }
  };

  return (
    <>
      <div
        className={`${styles.item} ${isSelected ? styles.selected : ''} ${task.completed ? styles.completed : ''}`}
        onClick={() => onSelect(task.id)}
      >
        <button
          className={styles.checkbox}
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          title={task.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
        >
          {task.completed ? '✓' : ''}
        </button>

        <div className={styles.content}>
          <span className={styles.title}>{task.title}</span>
          <div className={styles.bottomRow}>
            <button
              className={styles.metaBtn}
              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
              title="Изменить срок"
            >
              <span>{task.dueDate ? formatDate(task.dueDate) : 'Без даты'}</span>
            </button>

            {(onMoveToToday || onMoveToProject) && (
              <div className={styles.inboxActions} onClick={(e) => e.stopPropagation()}>
                {onMoveToToday && !task.dueDate && (
                  <button
                    className={styles.inboxBtn}
                    onClick={() => onMoveToToday(task.id)}
                    title="Перенести на сегодня"
                  >
                    📅 Сегодня
                  </button>
                )}
                {onMoveToProject && !task.projectId && (
                  <>
                    <button
                      className={styles.inboxBtn}
                      onClick={() => setShowProjectPicker((v) => !v)}
                      title="Добавить в проект"
                    >
                      📁 В проект
                    </button>
                    {showProjectPicker && (
                      <select
                        className={styles.projectPickerSelect}
                        autoFocus
                        defaultValue=""
                        onChange={handleProjectSelect}
                        onBlur={() => setShowProjectPicker(false)}
                      >
                        <option value="" disabled>Выберите проект...</option>
                        {allProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.parentId ? '↳ ' : ''}{p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          className={styles.deleteBtn}
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          title="Удалить задачу"
        >
          ×
        </button>
      </div>

      {showModal && (
        <TaskModal
          task={task}
          onUpdate={onUpdate}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
