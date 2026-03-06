import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ProjectProvider } from './context/ProjectContext';
import { NotesProvider } from './context/NotesContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ProjectsPage } from './pages/ProjectsPage/ProjectsPage';
import { NotesPage } from './pages/NotesPage/NotesPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { AuthPage } from './pages/AuthPage/AuthPage';
import './styles/global.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: 'var(--text-secondary)',
        background: 'var(--bg)',
      }}>
        ⏳
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
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
  );
}

export function App() {
  return (
    <BrowserRouter basename="/DailyApp">
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
