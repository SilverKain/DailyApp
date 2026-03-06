import React, { createContext, useContext, useEffect, useState } from 'react';
import { Task } from '../types';
import { storageService } from '../services/storageService';
import { generateId } from '../utils/generateId';
import { todayISO } from '../utils/dateHelpers';

interface TaskContextValue {
  tasks: Task[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  addTask: (title: string, projectId?: string | null, dueDate?: string | null) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  deleteTasksByProjectIds: (projectIds: string[]) => void;
  toggleTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => storageService.loadTasks());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    storageService.saveTasks(tasks);
  }, [tasks]);

  const addTask = (title: string, projectId: string | null = null, dueDate: string | null = null) => {
    const task: Task = {
      id: generateId(),
      title,
      description: '',
      completed: false,
      projectId,
      dueDate,
      links: [],
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const deleteTasksByProjectIds = (projectIds: string[]) => {
    const idSet = new Set(projectIds);
    setTasks((prev) => {
      const toDelete = new Set(prev.filter((t) => t.projectId && idSet.has(t.projectId)).map((t) => t.id));
      if (selectedTaskId && toDelete.has(selectedTaskId)) setSelectedTaskId(null);
      return prev.filter((t) => !t.projectId || !idSet.has(t.projectId));
    });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <TaskContext.Provider
      value={{ tasks, selectedTaskId, setSelectedTaskId, addTask, updateTask, deleteTask, deleteTasksByProjectIds, toggleTask }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
}

export { todayISO };
