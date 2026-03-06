import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project } from '../types';
import { storageService } from '../services/storageService';
import { generateId } from '../utils/generateId';

interface ProjectContextValue {
  projects: Project[];
  addProject: (name: string, icon: string, parentId?: string | null) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  deleteProjects: (ids: string[]) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => storageService.loadProjects());

  useEffect(() => {
    storageService.saveProjects(projects);
  }, [projects]);

  const addProject = (name: string, icon: string, parentId: string | null = null) => {
    const project: Project = {
      id: generateId(),
      name,
      icon,
      parentId,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, project]);
  };

  const updateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteProjects = (ids: string[]) => {
    const idSet = new Set(ids);
    setProjects((prev) => prev.filter((p) => !idSet.has(p.id)));
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject, deleteProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider');
  return ctx;
}
