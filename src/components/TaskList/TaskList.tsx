import React from 'react';
import { Task } from '../../types';
import { TaskItem } from '../TaskItem/TaskItem';
import { AddTaskInput } from '../AddTaskInput/AddTaskInput';
import styles from './TaskList.module.css';

interface Props {
  title: string;
  tasks: Task[];
  selectedTaskId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onAdd: (title: string) => void;
  onUpdate: (task: Task) => void;
  onMoveToToday?: (id: string) => void;
  onMoveToProject?: (id: string, projectId: string) => void;
}

export function TaskList({ title, tasks, selectedTaskId, onToggle, onDelete, onSelect, onAdd, onUpdate, onMoveToToday, onMoveToProject }: Props) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.list}>
        {tasks.length === 0 ? (
          <p className={styles.empty}>Нет задач</p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onToggle={onToggle}
              onDelete={onDelete}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onMoveToToday={onMoveToToday}
              onMoveToProject={onMoveToProject}
            />
          ))
        )}
      </div>
      <div className={styles.addInput}>
        <AddTaskInput onAdd={onAdd} />
      </div>
    </div>
  );
}
