import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project } from '../types';
import { generateId } from '../utils/generateId';
import { useAuth } from './AuthContext';
import {
  subscribeToProjects,
  saveProject,
  deleteProjectById,
  deleteProjectsByIds,
} from '../services/firestoreService';
import { localStorageProvider } from '../services/localStorageProvider';

interface ProjectContextValue {
  projects: Project[];
  loading: boolean;
  addProject: (name: string, icon: string, parentId?: string | null) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  deleteProjects: (ids: string[]) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProjects(localStorageProvider.loadProjects());
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToProjects(uid, (data) => {
      setProjects(data);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const addProject = (name: string, icon: string, parentId: string | null = null) => {
    const project: Project = {
      id: generateId(),
      name,
      icon,
      parentId,
      createdAt: new Date().toISOString(),
    };
    if (!uid) {
      setProjects((prev) => { const next = [...prev, project]; localStorageProvider.saveProjects(next); return next; });
    } else {
      saveProject(uid, project);
    }
  };

  const updateProject = (updated: Project) => {
    if (!uid) {
      setProjects((prev) => { const next = prev.map((p) => p.id === updated.id ? updated : p); localStorageProvider.saveProjects(next); return next; });
    } else {
      saveProject(uid, updated);
    }
  };

  const deleteProject = (id: string) => {
    if (!uid) {
      setProjects((prev) => { const next = prev.filter((p) => p.id !== id); localStorageProvider.saveProjects(next); return next; });
    } else {
      deleteProjectById(uid, id);
    }
  };

  const deleteProjects = (ids: string[]) => {
    if (!uid) {
      setProjects((prev) => { const next = prev.filter((p) => !ids.includes(p.id)); localStorageProvider.saveProjects(next); return next; });
    } else {
      deleteProjectsByIds(uid, ids);
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, addProject, updateProject, deleteProject, deleteProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider');
  return ctx;
}

