import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInWeeks, startOfWeek, addWeeks } from 'date-fns';

/**
 * Merge Tailwind classes safely
 * @param {...any} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format
 * @param {string} dateStr
 * @param {string} [fmt='MMM d, yyyy']
 * @returns {string}
 */
export function formatDate(dateStr, fmt = 'MMM d, yyyy') {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

/**
 * Format currency
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

/**
 * Format hours
 * @param {number} hours
 * @returns {string}
 */
export function formatHours(hours) {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours}h`;
}

/**
 * Get color for a utilization percentage
 * @param {number} pct - 0-100+ percentage
 * @returns {'green' | 'amber' | 'red'}
 */
export function getUtilizationColor(pct) {
  if (pct > 100) return 'red';
  if (pct >= 80) return 'amber';
  return 'green';
}

/**
 * Get CSS color value for utilization
 * @param {number} pct
 * @returns {string}
 */
export function getUtilizationHex(pct) {
  if (pct > 100) return '#ef4444';
  if (pct >= 80) return '#f59e0b';
  return '#22c55e';
}

/**
 * Get Tailwind classes for utilization bar
 * @param {number} pct
 * @returns {string}
 */
export function getUtilizationClasses(pct) {
  if (pct > 100) return 'bg-red-500';
  if (pct >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

/**
 * Get priority badge styles
 * @param {'critical'|'high'|'medium'|'low'} priority
 * @returns {string}
 */
export function getPriorityClasses(priority) {
  switch (priority) {
    case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

/**
 * Get status badge styles
 * @param {string} status
 * @returns {string}
 */
export function getStatusClasses(status) {
  switch (status) {
    case 'active': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'planning': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    case 'on-hold': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'in-progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'todo': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    case 'done': return 'bg-green-500/10 text-green-400 border-green-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

/**
 * Generate an array of week start dates
 * @param {number} count
 * @param {number} [offsetWeeks=0]
 * @returns {Date[]}
 */
export function getWeekDates(count, offsetWeeks = 0) {
  const base = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), offsetWeeks);
  return Array.from({ length: count }, (_, i) => addWeeks(base, i));
}

/**
 * Calculate budget burn percentage
 * @param {number} spent
 * @param {number} budget
 * @returns {number}
 */
export function burnPct(spent, budget) {
  if (!budget) return 0;
  return Math.round((spent / budget) * 100);
}

/**
 * Generate a stable avatar color from a string
 * @param {string} str
 * @returns {string}
 */
export function avatarColor(str) {
  const colors = [
    'bg-indigo-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-pink-500', 'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Truncate text to a given length
 * @param {string} str
 * @param {number} [len=60]
 * @returns {string}
 */
export function truncate(str, len = 60) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

/**
 * Generate a unique ID
 * @returns {string}
 */
export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Proficiency label
 * @param {number} level
 * @returns {string}
 */
export function proficiencyLabel(level) {
  return ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'][level] || '';
}
