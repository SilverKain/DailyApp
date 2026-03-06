/**
 * Firestore real-time service.
 * Данные хранятся в users/{uid}/tasks, users/{uid}/projects, users/{uid}/notes.
 * Синхронизация между устройствами через onSnapshot.
 */
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, Project, Note } from '../types';

// ── Collection helpers ───────────────────────────────────────────────

const userCol = (uid: string, col: string) => collection(db, 'users', uid, col);
const userDoc = (uid: string, col: string, id: string) => doc(db, 'users', uid, col, id);

// ── Tasks ────────────────────────────────────────────────────────────────

export function subscribeToTasks(uid: string, callback: (tasks: Task[]) => void): Unsubscribe {
  return onSnapshot(
    query(userCol(uid, 'tasks'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task)))
  );
}

export async function saveTask(uid: string, task: Task): Promise<void> {
  await setDoc(userDoc(uid, 'tasks', task.id), task);
}

export async function deleteTaskById(uid: string, id: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'tasks', id));
}

export async function deleteTasksByProjectIds(uid: string, projectIds: string[]): Promise<void> {
  if (projectIds.length === 0) return;
  const chunks: string[][] = [];
  for (let i = 0; i < projectIds.length; i += 10) chunks.push(projectIds.slice(i, i + 10));
  for (const chunk of chunks) {
    const snap = await import('firebase/firestore').then(({ getDocs }) =>
      getDocs(query(userCol(uid, 'tasks'), where('projectId', 'in', chunk)))
    );
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

// ── Projects ─────────────────────────────────────────────────────────────

export function subscribeToProjects(uid: string, callback: (projects: Project[]) => void): Unsubscribe {
  return onSnapshot(
    query(userCol(uid, 'projects'), orderBy('createdAt', 'asc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)))
  );
}

export async function saveProject(uid: string, project: Project): Promise<void> {
  await setDoc(userDoc(uid, 'projects', project.id), project);
}

export async function deleteProjectById(uid: string, id: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'projects', id));
}

export async function deleteProjectsByIds(uid: string, ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(userDoc(uid, 'projects', id)));
  await batch.commit();
}

// ── Notes ─────────────────────────────────────────────────────────────────

export function subscribeToNotes(uid: string, callback: (notes: Note[]) => void): Unsubscribe {
  return onSnapshot(
    query(userCol(uid, 'notes'), orderBy('updatedAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note)))
  );
}

export async function saveNote(uid: string, note: Note): Promise<void> {
  await setDoc(userDoc(uid, 'notes', note.id), note);
}

export async function deleteNoteById(uid: string, id: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'notes', id));
}

