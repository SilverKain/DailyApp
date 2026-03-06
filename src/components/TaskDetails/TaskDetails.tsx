import React, { useEffect, useState } from 'react';
import { Task, TaskLink } from '../../types';
import { useProjects } from '../../hooks/useProjects';
import { formatDate } from '../../utils/dateHelpers';
import { generateId } from '../../utils/generateId';
import styles from './TaskDetails.module.css';

interface Props {
  task: Task;
  onUpdate: (task: Task) => void;
  onClose: () => void;
}

export function TaskDetails({ task, onUpdate, onClose }: Props) {
  const { projects } = useProjects();
  const [form, setForm] = useState<Task>(task);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');

  useEffect(() => {
    setForm(task);
  }, [task.id]);

  const handleChange = <K extends keyof Task>(key: K, value: Task[K]) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    onUpdate(updated);
  };

  const handleAddLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !/^\/\//.test(url)) return;
    const newLink: TaskLink = {
      id: generateId(),
      url,
      label: linkLabel.trim() || url,
    };
    const updated = { ...form, links: [...(form.links ?? []), newLink] };
    setForm(updated);
    onUpdate(updated);
    setLinkUrl('');
    setLinkLabel('');
    setShowLinkForm(false);
  };

  const handleRemoveLink = (id: string) => {
    const updated = { ...form, links: (form.links ?? []).filter((l) => l.id !== id) };
    setForm(updated);
    onUpdate(updated);
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddLink();
    if (e.key === 'Escape') { setShowLinkForm(false); setLinkUrl(''); setLinkLabel(''); }
  };

  const project = projects.find((p) => p.id === form.projectId);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.meta}>
          {form.dueDate && (
            <span className={styles.chip}>📅 {formatDate(form.dueDate)}</span>
          )}
          {project && (
            <span className={styles.chip} style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              {project.icon} {project.name}
            </span>
          )}
        </div>
        <button className={styles.closeBtn} onClick={onClose} title="Закрыть">×</button>
      </div>

      {/* Title */}
      <input
        className={styles.titleInput}
        value={form.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="Название задачи"
      />

      {/* Description */}
      <div className={styles.descWrapper}>
        <textarea
          className={styles.descEditor}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Добавьте описание или заметки..."
        />
      </div>

      {/* Links section */}
      <div className={styles.linksSection}>
        <div className={styles.linksHeader}>
          <span className={styles.linksTitle}>🔗 Ссылки</span>
          <button
            className={styles.addLinkBtn}
            onClick={() => setShowLinkForm((v) => !v)}
            title="Добавить ссылку"
          >
            {showLinkForm ? '✕' : '+ Добавить'}
          </button>
        </div>

        {showLinkForm && (
          <div className={styles.linkForm}>
            <input
              className={styles.linkInput}
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              autoFocus
            />
            <input
              className={styles.linkInput}
              type="text"
              placeholder="Описание ссылки (необязательно)"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              onKeyDown={handleLinkKeyDown}
            />
            <div className={styles.linkFormBtns}>
              <button className={styles.linkSaveBtn} onClick={handleAddLink}>Добавить</button>
              <button className={styles.linkCancelBtn} onClick={() => { setShowLinkForm(false); setLinkUrl(''); setLinkLabel(''); }}>Отмена</button>
            </div>
          </div>
        )}

        {(form.links ?? []).length > 0 && (
          <ul className={styles.linkList}>
            {(form.links ?? []).map((link) => (
              <li key={link.id} className={styles.linkItem}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkAnchor}
                  title={link.url}
                >
                  🔗 {link.label}
                </a>
                <button
                  className={styles.linkRemoveBtn}
                  onClick={() => handleRemoveLink(link.id)}
                  title="Удалить ссылку"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer fields */}
      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <label className={styles.footerLabel}>Дата</label>
          <input
            className={styles.footerInput}
            type="date"
            value={form.dueDate ?? ''}
            onChange={(e) => handleChange('dueDate', e.target.value || null)}
          />
        </div>
        <div className={styles.footerRow}>
          <label className={styles.footerLabel}>Проект</label>
          <select
            className={styles.footerSelect}
            value={form.projectId ?? ''}
            onChange={(e) => handleChange('projectId', e.target.value || null)}
          >
            <option value="">— Без проекта —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.parentId ? '↳ ' : ''}{p.icon} {p.name}</option>
            ))}
          </select>
        </div>
        <label className={`${styles.footerRow} ${styles.checkRow}`}>
          <input
            type="checkbox"
            checked={form.completed}
            onChange={(e) => handleChange('completed', e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.footerLabel}>Выполнено</span>
        </label>
      </div>
    </div>
  );
}
