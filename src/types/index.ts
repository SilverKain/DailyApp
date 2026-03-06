export interface TaskLink {
  id: string;
  url: string;
  label: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  projectId: string | null;
  dueDate: string | null; // ISO date string
  links: TaskLink[];
  createdAt: string; // ISO date string
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  parentId: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
}

export interface StorageProvider {
  loadTasks(): Task[];
  saveTasks(tasks: Task[]): void;
  loadProjects(): Project[];
  saveProjects(projects: Project[]): void;
  loadNotes(): Note[];
  saveNotes(notes: Note[]): void;
  loadSettings(): AppSettings;
  saveSettings(settings: AppSettings): void;
}
