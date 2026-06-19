import { addWeeks, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { getResourceHoursInWeek } from './conflictDetector';

/**
 * Generate a 12-week forecast of utilization per resource.
 * @param {import('../types/index.js').Resource[]} resources
 * @param {import('../types/index.js').Allocation[]} allocations
 * @param {number} [weeks=12]
 * @returns {Array<{ week: Date, data: Array<{ resourceId: string, name: string, role: string, hours: number, capacity: number, utilization: number }> }>}
 */
export function generateForecast(resources, allocations, weeks = 12) {
  const base = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: weeks }, (_, i) => {
    const weekStart = addWeeks(base, i);
    const data = resources.map((r) => {
      const hours = getResourceHoursInWeek(r.id, weekStart, allocations);
      return {
        resourceId: r.id,
        name: r.name,
        role: r.role,
        department: r.department,
        hours,
        capacity: r.weeklyCapacity,
        utilization: r.weeklyCapacity > 0 ? Math.round((hours / r.weeklyCapacity) * 100) : 0,
      };
    });
    return { week: weekStart, data };
  });
}

/**
 * Generate a team-level (department) forecast.
 * @param {import('../types/index.js').Resource[]} resources
 * @param {import('../types/index.js').Allocation[]} allocations
 * @param {number} [weeks=12]
 * @returns {Array<{ week: Date, teams: Object.<string, { hours: number, capacity: number, utilization: number }> }>}
 */
export function generateTeamForecast(resources, allocations, weeks = 12) {
  const base = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: weeks }, (_, i) => {
    const weekStart = addWeeks(base, i);
    const teams = {};
    resources.forEach((r) => {
      const dept = r.department;
      if (!teams[dept]) teams[dept] = { hours: 0, capacity: 0 };
      const hours = getResourceHoursInWeek(r.id, weekStart, allocations);
      teams[dept].hours += hours;
      teams[dept].capacity += r.weeklyCapacity;
    });
    Object.keys(teams).forEach((dept) => {
      const t = teams[dept];
      t.utilization = t.capacity > 0 ? Math.round((t.hours / t.capacity) * 100) : 0;
    });
    return { week: weekStart, teams };
  });
}

/**
 * Identify bottleneck warnings from a forecast.
 * @param {ReturnType<typeof generateForecast>} forecast
 * @returns {Array<{ resourceId: string, name: string, weekIndex: number, week: Date, utilization: number }>}
 */
export function detectBottlenecks(forecast) {
  const warnings = [];
  forecast.forEach((weekData, idx) => {
    weekData.data.forEach((r) => {
      if (r.utilization > 100) {
        warnings.push({ ...r, weekIndex: idx, week: weekData.week });
      }
    });
  });
  return warnings;
}

/**
 * Simulate what-if: temporarily modify an allocation and recompute utilization.
 * @param {import('../types/index.js').Allocation[]} allocations
 * @param {import('../types/index.js').Allocation | null} simulatedAllocation - null = remove, obj = add/replace
 * @param {string | null} [removeId] - ID to remove before simulation
 * @param {import('../types/index.js').Resource[]} resources
 * @param {number} [weeks=8]
 * @returns {ReturnType<typeof generateForecast>}
 */
export function simulateWhatIf(allocations, simulatedAllocation, removeId, resources, weeks = 8) {
  let simAllocations = allocations.filter((a) => a.id !== removeId);
  if (simulatedAllocation) simAllocations = [...simAllocations, simulatedAllocation];
  return generateForecast(resources, simAllocations, weeks);
}
