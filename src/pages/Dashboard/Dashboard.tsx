import React, { useRef, useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { TaskList } from '../../components/TaskList/TaskList';
import { ProjectList } from '../../components/ProjectList/ProjectList';
import { Calendar } from '../../components/Calendar/Calendar';
import { TaskDetails } from '../../components/TaskDetails/TaskDetails';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const {
    tasks,
    inboxTasks,
    todayTasks,
    selectedTaskId,
    selectedTask,
    setSelectedTaskId,
    addTask,
    updateTask,
    deleteTask,
    deleteTasksByProjectIds,
    toggleTask,
    getTasksByDate,
    today,
  } = useTasks();

  const { projects, addProject, updateProject, deleteProjects } = useProjects();

  const [calendarDate, setCalendarDate] = useState<string | null>(null);
  const calendarTasks = calendarDate ? getTasksByDate(calendarDate) : [];

  // Mobile swipe — 0: главная (проекты + сегодня + детали), 1: календарь + входящие
  const [mobilePage, setMobilePage] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Свайп считается горизонтальным если dx > dy по модулю и смещение > 50px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0 && mobilePage === 0) setMobilePage(1);
      if (dx > 0 && mobilePage === 1) setMobilePage(0);
    }
  };

  // Каскадное удаление проекта и его задач
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

  const handleMoveToToday = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) updateTask({ ...task, dueDate: today });
  };

  const handleMoveToProject = (id: string, projectId: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) updateTask({ ...task, projectId });
  };

  return (
    <>
      {/* ── DESKTOP LAYOUT ── */}
      <div className={styles.dashboard}>
        {/* Center — детали задачи */}
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

      {/* ── MOBILE LAYOUT ── */}
      <div
        className={styles.mobileWrapper}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Слайдер */}
        <div
          className={styles.mobileSlider}
          style={{ transform: `translateX(${mobilePage === 0 ? '0%' : '-50%'})` }}
        >
          {/* Страница 0: Проекты → Сегодня → Детали задачи */}
          <div className={styles.mobilePage}>
            <div className={styles.mobileSection}>
              <ProjectList
                projects={projects}
                taskCounts={taskCounts}
                onAdd={addProject}
                onUpdate={updateProject}
                onDelete={handleDeleteProject}
              />
            </div>

            <div className={styles.mobileSection}>
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

            {selectedTask && (
              <div className={styles.mobileSection}>
                <TaskDetails
                  task={selectedTask}
                  onUpdate={updateTask}
                  onClose={() => setSelectedTaskId(null)}
                />
              </div>
            )}
          </div>

          {/* Страница 1: Календарь → Входящие */}
          <div className={styles.mobilePage}>
            <div className={styles.mobileSection}>
              <Calendar
                tasks={tasks}
                onSelectDate={(date) =>
                  setCalendarDate((prev) => (prev === date ? null : date))
                }
                selectedDate={calendarDate}
              />
            </div>

            {calendarDate && (
              <div className={styles.mobileSection}>
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

            <div className={styles.mobileSection}>
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
          </div>
        </div>

        {/* Индикатор страниц */}
        <div className={styles.mobilePageDots}>
          <button
            className={`${styles.mobileDot} ${mobilePage === 0 ? styles.mobileDotActive : ''}`}
            onClick={() => setMobilePage(0)}
            aria-label="Главная"
          />
          <button
            className={`${styles.mobileDot} ${mobilePage === 1 ? styles.mobileDotActive : ''}`}
            onClick={() => setMobilePage(1)}
            aria-label="Календарь"
          />
        </div>

        {/* Подсказка о свайпе */}
        <div className={styles.mobileSwipeHint}>
          {mobilePage === 0
            ? '← свайп для календаря'
            : 'свайп для проектов →'}
        </div>
      </div>
    </>
  );
}
