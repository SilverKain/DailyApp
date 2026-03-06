import { Task, Project, Note, AppSettings, StorageProvider } from '../types';

const KEYS = {
  TASKS: 'diary_tasks',
  PROJECTS: 'diary_projects',
  NOTES: 'diary_notes',
  SETTINGS: 'diary_settings',
};

const DEFAULT_SETTINGS: AppSettings = { theme: 'light' };

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const localStorageProvider: StorageProvider = {
  loadTasks: () =>
    getItem<Task[]>(KEYS.TASKS, []).map((t) => ({
      ...t,
      links: (t as any).links ?? [],
    })),
  saveTasks: (tasks) => setItem(KEYS.TASKS, tasks),
  loadProjects: () =>
    getItem<Project[]>(KEYS.PROJECTS, []).map((p) => ({
      ...p,
      icon: (p as any).icon ?? '📁',
      parentId: (p as any).parentId ?? null,
    })),
  saveProjects: (projects) => setItem(KEYS.PROJECTS, projects),
  loadNotes: () =>
    getItem<Note[]>(KEYS.NOTES, []).map((n) => ({
      ...n,
      projectId: (n as any).projectId ?? null,
    })),
  saveNotes: (notes) => setItem(KEYS.NOTES, notes),
  loadSettings: () => getItem<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings) => setItem(KEYS.SETTINGS, settings),
};

// Заглушка для будущего Firebase провайдера
export const firebaseProvider: StorageProvider = {
  loadTasks: () => [],
  saveTasks: () => {},
  loadProjects: () => [],
  saveProjects: () => {},
  loadNotes: () => [],
  saveNotes: () => {},
  loadSettings: () => DEFAULT_SETTINGS,
  saveSettings: () => {},
};
