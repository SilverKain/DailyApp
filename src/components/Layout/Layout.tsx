import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { ProjectList } from '../ProjectList/ProjectList';
import { TaskList } from '../TaskList/TaskList';
import styles from './Layout.module.css';

interface Props {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/notes', label: 'Заметки', icon: '📝' },
  { to: '/settings', label: 'Настройки', icon: '⚙' },
];

export function Layout({ children }: Props) {
  const { theme, toggleTheme } = useTheme();
  const {
    tasks,
    todayTasks,
    selectedTaskId,
    setSelectedTaskId,
    addTask,
    updateTask,
    deleteTask,
    deleteTasksByProjectIds,
    toggleTask,
    today,
  } = useTasks();
  const { projects, addProject, updateProject, deleteProjects } = useProjects();

  // Рекурсивно собирает ID проекта и всех его подпроектов
  const collectDescendantIds = (projectId: string): string[] => {
    const children = projects.filter((p) => p.parentId === projectId);
    return [projectId, ...children.flatMap((c) => collectDescendantIds(c.id))];
  };

  const handleDeleteProject = (id: string) => {
    const ids = collectDescendantIds(id);
    deleteTasksByProjectIds(ids);
    deleteProjects(ids);
  };

  const taskCounts = projects.reduce((acc, p) => {
    acc[p.id] = tasks.filter((t) => t.projectId === p.id && !t.completed).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={styles.app}>
      <nav className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📓</span>
          <span className={styles.logoText}>Ежедневник</span>
        </div>

        {/* Navigation */}
        <ul className={styles.navList}>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>⊞</span>
              <span className={styles.navLabel}>Задачи</span>
            </NavLink>
          </li>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.divider} />

        {/* Projects */}
        <div className={styles.section}>
          <ProjectList
            projects={projects}
            taskCounts={taskCounts}
            onAdd={addProject}
            onUpdate={updateProject}
            onDelete={handleDeleteProject}
          />
        </div>

        <div className={styles.divider} />

        {/* Today */}
        <div className={styles.section}>
          <TaskList
            title="Сегодня"
            tasks={todayTasks}
            selectedTaskId={selectedTaskId}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onSelect={setSelectedTaskId}
            onAdd={(title) => addTask(title, null, today)}
            onUpdate={updateTask}
          />
        </div>

        {/* Theme toggle */}
        <button className={styles.themeBtn} onClick={toggleTheme} title="Переключить тему">
          {theme === 'light' ? '🌙 Тёмная' : '☀️ Светлая'}
        </button>
      </nav>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
