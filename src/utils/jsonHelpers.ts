import { Task, Project, Note } from '../types';

interface ExportData {
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  exportedAt: string;
}

export function exportToJSON(tasks: Task[], projects: Project[], notes: Note[]): void {
  const data: ExportData = {
    tasks,
    projects,
    notes,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tasks-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(
  file: File,
  onSuccess: (data: ExportData) => void,
  onError: (msg: string) => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string) as ExportData;
      if (!data.tasks || !Array.isArray(data.tasks)) {
        onError('Некорректный формат файла: поле tasks отсутствует или не является массивом');
        return;
      }
      if (!data.projects || !Array.isArray(data.projects)) {
        onError('Некорректный формат файла: поле projects отсутствует или не является массивом');
        return;
      }
      onSuccess(data);
    } catch {
      onError('Не удалось разобрать JSON файл');
    }
  };
  reader.readAsText(file);
}
