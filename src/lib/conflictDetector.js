import {
  isWithinInterval,
  parseISO,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { generateId } from './utils';

/**
 * Check if two allocations overlap in time for the same resource.
 * @param {import('../types/index.js').Allocation} a1
 * @param {import('../types/index.js').Allocation} a2
 * @returns {boolean}
 */
function allocationsOverlap(a1, a2) {
  if (a1.resourceId !== a2.resourceId) return false;
  if (a1.id === a2.id) return false;
  const s1 = parseISO(a1.startDate), e1 = parseISO(a1.endDate);
  const s2 = parseISO(a2.startDate), e2 = parseISO(a2.endDate);
  return s1 < e2 && s2 < e1;
}

/**
 * Calculate total hours per week for a resource in a given week.
 * @param {string} resourceId
 * @param {Date} weekStart
 * @param {import('../types/index.js').Allocation[]} allocations
 * @returns {number}
 */
export function getResourceHoursInWeek(resourceId, weekStart, allocations) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return allocations
    .filter((a) => {
      if (a.resourceId !== resourceId) return false;
      const s = parseISO(a.startDate);
      const e = parseISO(a.endDate);
      return (
        isWithinInterval(weekStart, { start: s, end: e }) ||
        isWithinInterval(weekEnd, { start: s, end: e }) ||
        (s <= weekStart && e >= weekEnd)
      );
    })
    .reduce((sum, a) => sum + a.hoursPerWeek, 0);
}

/**
 * Detect all conflicts in the current allocation set.
 * @param {import('../types/index.js').Allocation[]} allocations
 * @param {import('../types/index.js').Resource[]} resources
 * @param {import('../types/index.js').Task[]} tasks
 * @returns {import('../types/index.js').Conflict[]}
 */
export function detectConflicts(allocations, resources, tasks) {
  const conflicts = [];
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const resourceMap = Object.fromEntries(resources.map((r) => [r.id, r]));
  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));

  // ── 1. Over-capacity detection ─────────────────────────────
  const resourceIds = [...new Set(allocations.map((a) => a.resourceId))];
  resourceIds.forEach((resourceId) => {
    const resource = resourceMap[resourceId];
    if (!resource) return;

    const totalHours = getResourceHoursInWeek(resourceId, weekStart, allocations);
    if (totalHours > resource.weeklyCapacity) {
      const involved = allocations
        .filter((a) => {
          if (a.resourceId !== resourceId) return false;
          const s = parseISO(a.startDate);
          const e = parseISO(a.endDate);
          return (
            isWithinInterval(weekStart, { start: s, end: e }) ||
            isWithinInterval(weekEnd, { start: s, end: e }) ||
            (s <= weekStart && e >= weekEnd)
          );
        })
        .map((a) => a.id);

      conflicts.push({
        id: generateId(),
        type: 'over-capacity',
        resourceId,
        allocationIds: involved,
        message: `${resource.name} is allocated ${totalHours}h/week against a ${resource.weeklyCapacity}h capacity (${Math.round(totalHours / resource.weeklyCapacity * 100)}% utilized)`,
        severity: 'error',
      });
    }
  });

  // ── 2. Skill mismatch detection ────────────────────────────
  allocations.forEach((allocation) => {
    const resource = resourceMap[allocation.resourceId];
    const task = taskMap[allocation.taskId];
    if (!resource || !task) return;

    const resourceSkillNames = resource.skills.map((s) => s.name);
    const missingSkills = task.requiredSkills.filter(
      (skill) => !resourceSkillNames.includes(skill)
    );

    if (missingSkills.length > 0) {
      conflicts.push({
        id: generateId(),
        type: 'skill-mismatch',
        resourceId: resource.id,
        allocationIds: [allocation.id],
        message: `${resource.name} lacks required skill(s): ${missingSkills.join(', ')} for task "${task.name}"`,
        severity: 'warning',
      });
    }
  });

  // ── 3. Double-booking (separate tasks at same time) ────────
  for (let i = 0; i < allocations.length; i++) {
    for (let j = i + 1; j < allocations.length; j++) {
      const a1 = allocations[i];
      const a2 = allocations[j];
      if (a1.taskId === a2.taskId) continue; // same task, not double-booking
      if (allocationsOverlap(a1, a2)) {
        const resource = resourceMap[a1.resourceId];
        if (!resource) continue;
        // Check if already flagged as over-capacity (avoid duplicate messages)
        const alreadyFlagged = conflicts.some(
          (c) => c.type === 'over-capacity' && c.resourceId === a1.resourceId
        );
        if (!alreadyFlagged) {
          conflicts.push({
            id: generateId(),
            type: 'double-booking',
            resourceId: a1.resourceId,
            allocationIds: [a1.id, a2.id],
            message: `${resource.name} is assigned to multiple tasks during the same period`,
            severity: 'warning',
          });
        }
      }
    }
  }

  // Deduplicate by (type + resourceId)
  const seen = new Set();
  return conflicts.filter((c) => {
    const key = `${c.type}-${c.resourceId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Check if a proposed new allocation would create conflicts.
 * @param {import('../types/index.js').Allocation} newAllocation
 * @param {import('../types/index.js').Allocation[]} existingAllocations
 * @param {import('../types/index.js').Resource[]} resources
 * @param {import('../types/index.js').Task[]} tasks
 * @returns {import('../types/index.js').Conflict[]}
 */
export function checkNewAllocationConflicts(
  newAllocation,
  existingAllocations,
  resources,
  tasks
) {
  const combined = [...existingAllocations, newAllocation];
  return detectConflicts(combined, resources, tasks).filter(
    (c) => c.allocationIds.includes(newAllocation.id)
  );
}
