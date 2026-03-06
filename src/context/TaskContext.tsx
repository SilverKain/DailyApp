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
  const uid = user!.uid;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  // Track selected separately to avoid closure issues in async calls
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selectedTaskId;

  useEffect(() => {
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
    saveTask(uid, task);
  };

  const updateTask = (updated: Task) => saveTask(uid, updated);

  const deleteTask = (id: string) => {
    if (selectedRef.current === id) setSelectedTaskId(null);
    deleteTaskById(uid, id);
  };

  const deleteTasksByProjectIds = (projectIds: string[]) => {
    fsDeleteTasksByProjectIds(uid, projectIds);
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) saveTask(uid, { ...task, completed: !task.completed });
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

