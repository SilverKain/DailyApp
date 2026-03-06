/**
 * Firestore async service.
 * Предоставляет CRUD операции для Task, Project, Note, AppSettings.
 * При необходимости заменяет localStorageProvider в контекстах.
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, Project, Note, AppSettings } from '../types';

// ── Collection refs ───────────────────────────────────────────────────────────

const tasksCol = collection(db, 'tasks');
const projectsCol = collection(db, 'projects');
const notesCol = collection(db, 'notes');
const settingsDoc = (userId: string) => doc(db, 'settings', userId);

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function getTasks(): Promise<Task[]> {
  const snap = await getDocs(query(tasksCol, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
}

export function subscribeToTasks(callback: (tasks: Task[]) => void): Unsubscribe {
  return onSnapshot(query(tasksCol, orderBy('createdAt', 'desc')), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
  });
}

export async function saveTask(task: Task): Promise<void> {
  await setDoc(doc(tasksCol, task.id), task);
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(tasksCol, id));
}

export async function deleteTasksByProjectIds(projectIds: string[]): Promise<void> {
  if (projectIds.length === 0) return;
  const snap = await getDocs(query(tasksCol, where('projectId', 'in', projectIds)));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const snap = await getDocs(query(projectsCol, orderBy('createdAt', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
}

export function subscribeToProjects(callback: (projects: Project[]) => void): Unsubscribe {
  return onSnapshot(query(projectsCol, orderBy('createdAt', 'asc')), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
  });
}

export async function saveProject(project: Project): Promise<void> {
  await setDoc(doc(projectsCol, project.id), project);
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(projectsCol, id));
}

export async function deleteProjects(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(doc(projectsCol, id)));
  await batch.commit();
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function getNotes(): Promise<Note[]> {
  const snap = await getDocs(query(notesCol, orderBy('updatedAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note));
}

export function subscribeToNotes(callback: (notes: Note[]) => void): Unsubscribe {
  return onSnapshot(query(notesCol, orderBy('updatedAt', 'desc')), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note)));
  });
}

export async function saveNote(note: Note): Promise<void> {
  await setDoc(doc(notesCol, note.id), note);
}

export async function deleteNote(id: string): Promise<void> {
  await deleteDoc(doc(notesCol, id));
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSettings(userId: string): Promise<AppSettings | null> {
  const snap = await getDoc(settingsDoc(userId));
  return snap.exists() ? (snap.data() as AppSettings) : null;
}

export async function saveSettings(userId: string, settings: AppSettings): Promise<void> {
  await setDoc(settingsDoc(userId), settings);
}
