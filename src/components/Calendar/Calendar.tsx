import React, { useState } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, monthName, toISODate } from '../../utils/dateHelpers';
import styles from './Calendar.module.css';

interface Props {
  tasks: { dueDate: string | null }[];
  onSelectDate: (date: string) => void;
  selectedDate?: string | null;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function Calendar({ tasks, onSelectDate, selectedDate }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = toISODate(now);

  const datesWithTasks = new Set(
    tasks
      .filter((t) => t.dueDate)
      .map((t) => t.dueDate!.split('T')[0])
  );

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prevMonth}>‹</button>
        <span className={styles.monthLabel}>{monthName(month)} {year}</span>
        <button className={styles.navBtn} onClick={nextMonth}>›</button>
      </div>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d} className={styles.weekday}>{d}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((day, idx) => {
          if (!day) return <span key={`empty-${idx}`} />;
          const dateStr = getDateStr(day);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasTasks = datesWithTasks.has(dateStr);
          return (
            <button
              key={dateStr}
              className={`${styles.day} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelectDate(dateStr)}
            >
              {day}
              {hasTasks && <span className={styles.dot} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
