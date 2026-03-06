import React, { useState } from 'react';
import styles from './AddTaskInput.module.css';

interface Props {
  onAdd: (title: string) => void;
  placeholder?: string;
}

export function AddTaskInput({ onAdd, placeholder = 'Добавить задачу...' }: Props) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>+</span>
      <input
        className={styles.input}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
