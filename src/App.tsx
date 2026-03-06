import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { ProjectProvider } from './context/ProjectContext';
import { NotesProvider } from './context/NotesContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ProjectsPage } from './pages/ProjectsPage/ProjectsPage';
import { NotesPage } from './pages/NotesPage/NotesPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import './styles/global.css';

export function App() {
  return (
    <BrowserRouter basename="/DailyApp">
      <ThemeProvider>
        <ProjectProvider>
          <TaskProvider>
            <NotesProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects/:id" element={<ProjectsPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Layout>
            </NotesProvider>
          </TaskProvider>
        </ProjectProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
