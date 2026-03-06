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
  const uid = user!.uid;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    saveProject(uid, project);
  };

  const updateProject = (updated: Project) => saveProject(uid, updated);

  const deleteProject = (id: string) => deleteProjectById(uid, id);

  const deleteProjects = (ids: string[]) => deleteProjectsByIds(uid, ids);

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

