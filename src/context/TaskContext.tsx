import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Task } from '../types';
import { generateId } from '../utils/generateId';
import { todayISO } from '../utils/dateHelpers';
import { useAuth } from './AuthContext';
import {
  subscribeToTasks,
  saveTask,
  deleteTaskById,
  deleteTasksByProjectIds as fsDeleteTasksByProjectIds,
} from '../services/firestoreService';
import { localStorageProvider } from '../services/localStorageProvider';

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
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
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selectedTaskId;

  useEffect(() => {
    if (!uid) {
      setTasks(localStorageProvider.loadTasks());
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToTasks(uid, (data) => {
      setTasks(data);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

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
    if (!uid) {
      setTasks((prev) => { const next = [task, ...prev]; localStorageProvider.saveTasks(next); return next; });
    } else {
      saveTask(uid, task);
    }
  };

  const updateTask = (updated: Task) => {
    if (!uid) {
      setTasks((prev) => { const next = prev.map((t) => t.id === updated.id ? updated : t); localStorageProvider.saveTasks(next); return next; });
    } else {
      saveTask(uid, updated);
    }
  };

  const deleteTask = (id: string) => {
    if (selectedRef.current === id) setSelectedTaskId(null);
    if (!uid) {
      setTasks((prev) => { const next = prev.filter((t) => t.id !== id); localStorageProvider.saveTasks(next); return next; });
    } else {
      deleteTaskById(uid, id);
    }
  };

  const deleteTasksByProjectIds = (projectIds: string[]) => {
    if (!uid) {
      setTasks((prev) => { const next = prev.filter((t) => !t.projectId || !projectIds.includes(t.projectId)); localStorageProvider.saveTasks(next); return next; });
    } else {
      fsDeleteTasksByProjectIds(uid, projectIds);
    }
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    if (!uid) {
      setTasks((prev) => { const next = prev.map((t) => t.id === id ? updated : t); localStorageProvider.saveTasks(next); return next; });
    } else {
      saveTask(uid, updated);
    }
  };

  return (
    <TaskContext.Provider
      value={{ tasks, loading, selectedTaskId, setSelectedTaskId, addTask, updateTask, deleteTask, deleteTasksByProjectIds, toggleTask }}
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

