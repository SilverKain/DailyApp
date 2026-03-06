import { Task, Project, Note, AppSettings } from '../types';
import { localStorageProvider } from './localStorageProvider';

// Активный провайдер — при необходимости заменить на firebaseProvider
const provider = localStorageProvider;

export const storageService = {
  loadTasks: (): Task[] => provider.loadTasks(),
  saveTasks: (tasks: Task[]): void => provider.saveTasks(tasks),
  loadProjects: (): Project[] => provider.loadProjects(),
  saveProjects: (projects: Project[]): void => provider.saveProjects(projects),
  loadNotes: (): Note[] => provider.loadNotes(),
  saveNotes: (notes: Note[]): void => provider.saveNotes(notes),
  loadSettings: (): AppSettings => provider.loadSettings(),
  saveSettings: (settings: AppSettings): void => provider.saveSettings(settings),
};
