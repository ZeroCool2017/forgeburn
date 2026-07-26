const MS_PER_DAY = 24 * 60 * 60 * 1000;

function localDate(value) {
  if (!value) return null;
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayLocal() {
  return localDate(new Date());
}

export function daysFromToday(value, reference = todayLocal()) {
  const date = localDate(value);
  if (!date) return null;
  return Math.round((date.getTime() - reference.getTime()) / MS_PER_DAY);
}

export function advanceDueDate(value, frequency = 'monthly') {
  const date = localDate(value) || todayLocal();
  if (frequency === 'biweekly') {
    date.setDate(date.getDate() + 14);
  } else {
    const originalDay = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(originalDay, lastDay));
  }
  return isoDate(date);
}

export function dueStatus(loan, reference = todayLocal()) {
  const date = loan.next_due_date || loan.due_date;
  const days = daysFromToday(date, reference);
  if (days === null) return { label: 'No due date set', tone: 'muted', days: null };
  if (days < 0) return { label: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`, tone: 'danger', days };
  if (days === 0) return { label: 'Due today', tone: 'warning', days };
  if (days === 1) return { label: 'Due tomorrow', tone: 'warning', days };
  return { label: `Due in ${days} days`, tone: 'muted', days };
}

export function formatDueDate(value) {
  const date = localDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export { isoDate };
