import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import styles from './ProjectList.module.css';

interface Props {
  projects: Project[];
  taskCounts: Record<string, number>;
  onAdd: (name: string, icon: string, parentId?: string | null) => void;
  onDelete: (id: string) => void;
  onUpdate: (project: Project) => void;
}

const PROJECT_ICONS = [
  '📁','📂','📋','📌','⭐','🎯','💡','🔧','🏠','💼',
  '🎓','🚀','💰','🎨','✏️','📝','🔍','❤️','⚡','🏆',
  '🛒','🎵','🌿','🔬','📊','🌐','🎮','📷','🍀','🔑',
];

interface AddFormState {
  parentId: string | null;
  name: string;
  icon: string;
}

export function ProjectList({ projects, taskCounts, onAdd, onDelete, onUpdate }: Props) {
  const [addForm, setAddForm] = useState<AddFormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpenId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenId]);

  const topLevel = projects.filter((p) => !p.parentId);
  const getChildren = (parentId: string) => projects.filter((p) => p.parentId === parentId);

  const startAdd = (parentId: string | null = null) => {
    setMenuOpenId(null);
    setAddForm({ parentId, name: '', icon: PROJECT_ICONS[0] });
  };

  const handleAddConfirm = () => {
    if (!addForm || !addForm.name.trim()) return;
    onAdd(addForm.name.trim(), addForm.icon, addForm.parentId);
    setAddForm(null);
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddConfirm();
    if (e.key === 'Escape') setAddForm(null);
  };

  const startEdit = (p: Project) => {
    setMenuOpenId(null);
    setEditingId(p.id);
    setEditName(p.name);
  };

  const handleEditConfirm = (p: Project) => {
    if (editName.trim()) onUpdate({ ...p, name: editName.trim() });
    setEditingId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, p: Project) => {
    if (e.key === 'Enter') handleEditConfirm(p);
    if (e.key === 'Escape') setEditingId(null);
  };

  const renderProject = (p: Project, depth = 0): React.ReactNode => {
    const children = getChildren(p.id);
    const isEditing = editingId === p.id;
    const isMenuOpen = menuOpenId === p.id;
    const count = taskCounts[p.id];

    return (
      <div key={p.id} className={styles.projectGroup}>
        <div
          className={styles.item}
          style={depth > 0 ? { paddingLeft: `${10 + depth * 14}px` } : undefined}
        >
          {isEditing ? (
            <div className={styles.inlineEdit}>
              <span className={styles.icon}>{p.icon}</span>
              <input
                className={styles.renameInput}
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => handleEditKeyDown(e, p)}
                onBlur={() => handleEditConfirm(p)}
              />
            </div>
          ) : (
            <Link to={`/projects/${p.id}`} className={styles.projectLink}>
              <span className={styles.icon}>{p.icon}</span>
              <span className={styles.name}>{p.name}</span>
              {count !== undefined && count > 0 && (
                <span className={styles.count}>{count}</span>
              )}
            </Link>
          )}

          {!isEditing && (
            <div className={styles.menuWrap} ref={isMenuOpen ? menuRef : null}>
              <button
                className={styles.menuBtn}
                onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : p.id); }}
                title="Действия"
              >
                ⋯
              </button>
              {isMenuOpen && (
                <div className={styles.dropdown}>
                  <button className={styles.dropdownItem} onClick={() => startEdit(p)}>
                    ✏️ Переименовать
                  </button>
                  <button className={styles.dropdownItem} onClick={() => startAdd(p.id)}>
                    ＋ Добавить подпроект
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                    onClick={() => { setMenuOpenId(null); onDelete(p.id); }}
                  >
                    🗑 Удалить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sub-project add form */}
        {addForm && addForm.parentId === p.id && (
          <div className={styles.addForm} style={{ marginLeft: `${(depth + 1) * 14 + 10}px` }}>
            <input
              className={styles.input}
              autoFocus
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              onKeyDown={handleAddKeyDown}
              placeholder="Название подпроекта"
            />
            <div className={styles.iconRow}>
              {PROJECT_ICONS.map((ic) => (
                <button
                  key={ic}
                  className={`${styles.iconBtn} ${addForm.icon === ic ? styles.iconSelected : ''}`}
                  onClick={() => setAddForm({ ...addForm, icon: ic })}
                >
                  {ic}
                </button>
              ))}
            </div>
            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={handleAddConfirm}>Добавить</button>
              <button className={styles.cancelBtn} onClick={() => setAddForm(null)}>Отмена</button>
            </div>
          </div>
        )}

        {children.map((child) => renderProject(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Проекты</h3>
        <button className={styles.addBtn} onClick={() => startAdd(null)} title="Добавить проект">+</button>
      </div>
      <div className={styles.list}>
        {topLevel.map((p) => renderProject(p))}
        {projects.length === 0 && !addForm && (
          <p className={styles.empty}>Нет проектов</p>
        )}
      </div>

      {/* Top-level add form */}
      {addForm && addForm.parentId === null && (
        <div className={styles.addForm}>
          <input
            className={styles.input}
            autoFocus
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            onKeyDown={handleAddKeyDown}
            placeholder="Название проекта"
          />
          <div className={styles.iconRow}>
            {PROJECT_ICONS.map((ic) => (
              <button
                key={ic}
                className={`${styles.iconBtn} ${addForm.icon === ic ? styles.iconSelected : ''}`}
                onClick={() => setAddForm({ ...addForm, icon: ic })}
              >
                {ic}
              </button>
            ))}
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleAddConfirm}>Добавить</button>
            <button className={styles.cancelBtn} onClick={() => setAddForm(null)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}
