import { useTaskContext } from '../context/TaskContext';
import { todayISO, isSameDay } from '../utils/dateHelpers';

export function useTasks() {
  const ctx = useTaskContext();
  const today = todayISO();

  const todayTasks = ctx.tasks.filter(
    (t) => t.dueDate && isSameDay(t.dueDate, today)
  );

  const inboxTasks = ctx.tasks.filter((t) => !t.dueDate && !t.projectId);

  const getTasksByProject = (projectId: string) =>
    ctx.tasks.filter((t) => t.projectId === projectId);

  const getTasksByDate = (date: string) =>
    ctx.tasks.filter((t) => t.dueDate && isSameDay(t.dueDate, date));

  const selectedTask = ctx.selectedTaskId
    ? ctx.tasks.find((t) => t.id === ctx.selectedTaskId) ?? null
    : null;

  return {
    ...ctx,
    todayTasks,
    inboxTasks,
    getTasksByProject,
    getTasksByDate,
    selectedTask,
    today,
  };
}
