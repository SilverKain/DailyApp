import React, { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { TaskList } from '../../components/TaskList/TaskList';
import { Calendar } from '../../components/Calendar/Calendar';
import { TaskDetails } from '../../components/TaskDetails/TaskDetails';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const {
    tasks,
    inboxTasks,
    selectedTaskId,
    selectedTask,
    setSelectedTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTasksByDate,
    today,
  } = useTasks();

  const [calendarDate, setCalendarDate] = useState<string | null>(null);
  const calendarTasks = calendarDate ? getTasksByDate(calendarDate) : [];

  const handleMoveToToday = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) updateTask({ ...task, dueDate: today });
  };

  const handleMoveToProject = (id: string, projectId: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) updateTask({ ...task, projectId });
  };

  return (
    <div className={styles.dashboard}>
      {/* Center — зона деталей */}
      <section className={styles.centerCol}>
        {selectedTask ? (
          <TaskDetails
            task={selectedTask}
            onUpdate={updateTask}
            onClose={() => setSelectedTaskId(null)}
          />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>📋</span>
            <p>Выберите задачу для редактирования</p>
            <p className={styles.placeholderHint}>Кликните на любую задачу в правой панели</p>
          </div>
        )}
      </section>

      {/* Right panel — календарь + входящие */}
      <aside className={styles.rightPanel}>
        <div className={styles.panel}>
          <Calendar
            tasks={tasks}
            onSelectDate={(date) =>
              setCalendarDate((prev) => (prev === date ? null : date))
            }
            selectedDate={calendarDate}
          />
        </div>

        {calendarDate && (
          <div className={styles.panel}>
            <TaskList
              title={`Задачи на ${calendarDate}`}
              tasks={calendarTasks}
              selectedTaskId={selectedTaskId}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onSelect={setSelectedTaskId}
              onAdd={(title) => addTask(title, null, calendarDate)}
              onUpdate={updateTask}
            />
          </div>
        )}

        <div className={styles.panel}>
          <TaskList
            title="Входящие"
            tasks={inboxTasks}
            selectedTaskId={selectedTaskId}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onSelect={setSelectedTaskId}
            onAdd={(title) => addTask(title)}
            onUpdate={updateTask}
            onMoveToToday={handleMoveToToday}
            onMoveToProject={handleMoveToProject}
          />
        </div>
      </aside>
    </div>
  );
}
