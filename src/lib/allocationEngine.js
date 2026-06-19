import { isWithinInterval, parseISO, startOfWeek, endOfWeek, addWeeks } from 'date-fns';

/**
 * Default allocation engine weights (sum = 1)
 * @typedef {Object} EngineWeights
 * @property {number} skill        - skill overlap score weight
 * @property {number} availability - free capacity score weight
 * @property {number} cost         - cost efficiency weight
 * @property {number} workload     - workload balance weight
 */
export const DEFAULT_WEIGHTS = {
  skill: 0.40,
  availability: 0.30,
  cost: 0.15,
  workload: 0.15,
};

/**
 * Calculate how well a resource's skills match a task's required skills.
 * Returns 0-1 score.
 * @param {import('../types/index.js').Resource} resource
 * @param {import('../types/index.js').Task} task
 * @returns {number}
 */
function skillOverlapScore(resource, task) {
  if (!task.requiredSkills || task.requiredSkills.length === 0) return 1;
  const resourceSkillMap = {};
  resource.skills.forEach((s) => { resourceSkillMap[s.name] = s.proficiency; });

  let totalPossible = task.requiredSkills.length * 5; // max proficiency = 5
  let earned = 0;
  task.requiredSkills.forEach((skill) => {
    earned += resourceSkillMap[skill] || 0;
  });
  return totalPossible > 0 ? earned / totalPossible : 0;
}

/**
 * Calculate how much free capacity a resource has relative to the task.
 * Returns 0-1 score.
 * @param {import('../types/index.js').Resource} resource
 * @param {import('../types/index.js').Task} task
 * @param {import('../types/index.js').Allocation[]} allAllocations
 * @returns {number}
 */
function freeCapacityScore(resource, task, allAllocations) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Sum hours currently allocated this week
  const allocatedHours = allAllocations
    .filter((a) => {
      if (a.resourceId !== resource.id) return false;
      const start = parseISO(a.startDate);
      const end = parseISO(a.endDate);
      return (
        isWithinInterval(weekStart, { start, end }) ||
        isWithinInterval(weekEnd, { start, end }) ||
        (start <= weekStart && end >= weekEnd)
      );
    })
    .reduce((sum, a) => sum + a.hoursPerWeek, 0);

  const freeHours = Math.max(0, resource.weeklyCapacity - allocatedHours);
  const neededPerWeek = task.estimatedHours / 4; // assume ~4 weeks duration
  
  if (freeHours === 0) return 0;
  if (freeHours >= neededPerWeek) return 1;
  return freeHours / neededPerWeek;
}

/**
 * Score cost efficiency — cheaper relative to peer group is better.
 * Returns 0-1 score.
 * @param {import('../types/index.js').Resource} resource
 * @param {import('../types/index.js').Resource[]} allResources
 * @returns {number}
 */
function costEfficiencyScore(resource, allResources) {
  const costs = allResources.map((r) => r.hourlyCost);
  const maxCost = Math.max(...costs);
  const minCost = Math.min(...costs);
  if (maxCost === minCost) return 1;
  // Invert: lower cost → higher score
  return 1 - (resource.hourlyCost - minCost) / (maxCost - minCost);
}

/**
 * Score workload balance — penalize resources already near capacity.
 * Returns 0-1 score.
 * @param {import('../types/index.js').Resource} resource
 * @param {import('../types/index.js').Allocation[]} allAllocations
 * @returns {number}
 */
function workloadBalanceScore(resource, allAllocations) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const allocated = allAllocations
    .filter((a) => {
      if (a.resourceId !== resource.id) return false;
      const start = parseISO(a.startDate);
      const end = parseISO(a.endDate);
      return (
        isWithinInterval(weekStart, { start, end }) ||
        isWithinInterval(weekEnd, { start, end }) ||
        (start <= weekStart && end >= weekEnd)
      );
    })
    .reduce((sum, a) => sum + a.hoursPerWeek, 0);

  const utilization = allocated / resource.weeklyCapacity;
  // Score drops sharply after 70% utilization
  if (utilization >= 1) return 0;
  if (utilization >= 0.7) return (1 - utilization) * 3.33; // linear from 0.7→0
  return 1 - utilization;
}

/**
 * Score a resource against a task.
 * @param {import('../types/index.js').Resource} resource
 * @param {import('../types/index.js').Task} task
 * @param {import('../types/index.js').Resource[]} allResources
 * @param {import('../types/index.js').Allocation[]} allAllocations
 * @param {EngineWeights} [weights]
 * @returns {{ score: number, breakdown: Object, reasons: string[] }}
 */
export function scoreResourceForTask(
  resource,
  task,
  allResources,
  allAllocations,
  weights = DEFAULT_WEIGHTS
) {
  const skill = skillOverlapScore(resource, task);
  const availability = freeCapacityScore(resource, task, allAllocations);
  const cost = costEfficiencyScore(resource, allResources);
  const workload = workloadBalanceScore(resource, allAllocations);

  const score =
    weights.skill * skill +
    weights.availability * availability +
    weights.cost * cost +
    weights.workload * workload;

  const reasons = [];
  if (skill >= 0.8) reasons.push('Strong skill match');
  else if (skill >= 0.5) reasons.push('Partial skill match');
  else reasons.push('Weak skill match');

  if (availability >= 0.8) reasons.push('High free capacity');
  else if (availability >= 0.4) reasons.push('Moderate availability');
  else reasons.push('Low availability');

  if (cost >= 0.7) reasons.push('Cost efficient');
  if (workload >= 0.7) reasons.push('Low current workload');
  else if (workload < 0.3) reasons.push('High current workload');

  return {
    score,
    breakdown: { skill, availability, cost, workload },
    reasons,
  };
}

/**
 * Run the full allocation engine: for each unassigned task, rank all eligible resources.
 * @param {import('../types/index.js').Task[]} unassignedTasks
 * @param {import('../types/index.js').Resource[]} allResources
 * @param {import('../types/index.js').Allocation[]} allAllocations
 * @param {EngineWeights} [weights]
 * @returns {Array<{ task: import('../types/index.js').Task, suggestions: Array<{ resource: import('../types/index.js').Resource, score: number, breakdown: Object, reasons: string[] }> }>}
 */
export function runAutoAllocate(
  unassignedTasks,
  allResources,
  allAllocations,
  weights = DEFAULT_WEIGHTS
) {
  return unassignedTasks.map((task) => {
    const suggestions = allResources
      .map((resource) => {
        const { score, breakdown, reasons } = scoreResourceForTask(
          resource, task, allResources, allAllocations, weights
        );
        return { resource, score, breakdown, reasons };
      })
      .filter((s) => s.score > 0.1) // filter out totally unqualified
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // top 5 suggestions

    return { task, suggestions };
  });
}
