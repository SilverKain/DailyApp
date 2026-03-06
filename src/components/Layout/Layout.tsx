import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
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
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);
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
        {/* User block */}
        {user ? (
          <div className={styles.userBlock} ref={userMenuRef}>
            <div className={styles.userBlockInner} onClick={() => setUserMenuOpen((v) => !v)}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className={styles.userAvatar} referrerPolicy="no-referrer" />
              ) : (
                <div className={styles.userAvatarFallback}>
                  {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {user.displayName ?? user.email?.split('@')[0] ?? 'Пользователь'}
                </span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
              <button className={styles.logoutBtn} onClick={(e) => { e.stopPropagation(); logout(); }} title="Выйти">
                →
              </button>
            </div>
            {userMenuOpen && (
              <div className={styles.userMenu}>
                <div className={styles.userMenuName}>
                  {user.displayName ?? user.email?.split('@')[0]}
                </div>
                <div className={styles.userMenuEmail}>{user.email}</div>
                <button className={styles.userMenuLogout} onClick={logout}>
                  🚪 Выйти
                </button>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/login" className={styles.guestBlock}>
            <span>🔑</span>
            <span>Войти в аккаунт</span>
          </NavLink>
        )}

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
          {/* Mobile logout / login */}
          {user ? (
            <li className={styles.mobileLogoutItem}>
              <button className={styles.mobileLogoutBtn} onClick={logout} title="Выйти">
                <span className={styles.navIcon}>🚪</span>
                <span className={styles.navLabel}>Выйти</span>
              </button>
            </li>
          ) : (
            <li className={styles.mobileLogoutItem}>
              <NavLink to="/login" className={styles.mobileLogoutBtn}>
                <span className={styles.navIcon}>🔑</span>
                <span className={styles.navLabel}>Войти</span>
              </NavLink>
            </li>
          )}
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
