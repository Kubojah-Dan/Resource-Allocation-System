import { addDays, format, startOfWeek } from 'date-fns';

const BASE = startOfWeek(new Date(), { weekStartsOn: 1 });
const d = (weeksOffset, daysOffset = 0) =>
  format(addDays(BASE, weeksOffset * 7 + daysOffset), 'yyyy-MM-dd');

/**
 * Mock allocations — includes deliberate conflicts for demo purposes:
 * - CONFLICT 1: Alex Chen (r1) assigned 48h/week when capacity is 40h (over-capacity)
 * - CONFLICT 2: Sofia Martinez (r6) double-booked: 24h + 24h = 48h when capacity is 40h
 * - CONFLICT 3: Morgan Lee (r5) assigned to Java task but has no Java skill (skill mismatch)
 * @type {import('../types/index.js').Allocation[]}
 */
export const mockAllocations = [
  // ── Nexus Platform Rewrite ─────────────────────────────────
  {
    id: 'a1',
    resourceId: 'r1', // Alex Chen
    taskId: 't2',
    projectId: 'p1',
    startDate: d(0),
    endDate: d(4),
    hoursPerWeek: 32, // main API task
  },
  {
    id: 'a2',
    resourceId: 'r1', // Alex Chen — CONFLICT: this pushes him to 32+16=48h/wk
    taskId: 't3',
    projectId: 'p1',
    startDate: d(0),
    endDate: d(5),
    hoursPerWeek: 16,
  },
  {
    id: 'a3',
    resourceId: 'r3', // Jordan Walsh
    taskId: 't3',
    projectId: 'p1',
    startDate: d(1),
    endDate: d(5),
    hoursPerWeek: 24,
  },
  {
    id: 'a4',
    resourceId: 'r6', // Sofia Martinez — Design
    taskId: 't4',
    projectId: 'p1',
    startDate: d(0),
    endDate: d(2),
    hoursPerWeek: 24,
  },
  {
    id: 'a5',
    resourceId: 'r11', // Taylor Brooks — QA
    taskId: 't5',
    projectId: 'p1',
    startDate: d(3),
    endDate: d(5),
    hoursPerWeek: 24,
  },
  {
    id: 'a6',
    resourceId: 'r9', // Dana Kim — PM
    taskId: 't1',
    projectId: 'p1',
    startDate: d(-1),
    endDate: d(0),
    hoursPerWeek: 20,
  },
  // ── DataVault Analytics Dashboard ─────────────────────────
  {
    id: 'a7',
    resourceId: 'r2', // Priya Patel — Python/AWS
    taskId: 't7',
    projectId: 'p2',
    startDate: d(-2),
    endDate: d(0),
    hoursPerWeek: 32,
  },
  {
    id: 'a8',
    resourceId: 'r6', // Sofia Martinez — CONFLICT: 24h + 24h = 48h, over capacity
    taskId: 't8',
    projectId: 'p2',
    startDate: d(0),
    endDate: d(2),
    hoursPerWeek: 24,
  },
  {
    id: 'a9',
    resourceId: 'r1', // Alex Chen
    taskId: 't9',
    projectId: 'p2',
    startDate: d(1),
    endDate: d(3),
    hoursPerWeek: 20,
  },
  {
    id: 'a10',
    resourceId: 'r2', // Priya Patel
    taskId: 't10',
    projectId: 'p2',
    startDate: d(0),
    endDate: d(3),
    hoursPerWeek: 32,
  },
  {
    id: 'a11',
    resourceId: 'r12', // Rin Takahashi — QA
    taskId: 't11',
    projectId: 'p2',
    startDate: d(2),
    endDate: d(4),
    hoursPerWeek: 24,
  },
  {
    id: 'a12',
    resourceId: 'r10', // Chris Okonkwo — PM
    taskId: 't7',
    projectId: 'p2',
    startDate: d(-2),
    endDate: d(-1),
    hoursPerWeek: 16,
  },
  // ── CloudShift Migration ───────────────────────────────────
  {
    id: 'a13',
    resourceId: 'r14', // Niko Petrov — DevOps
    taskId: 't12',
    projectId: 'p3',
    startDate: d(0),
    endDate: d(2),
    hoursPerWeek: 32,
  },
  {
    id: 'a14',
    resourceId: 'r15', // Amara Diallo — DevOps
    taskId: 't13',
    projectId: 'p3',
    startDate: d(1),
    endDate: d(3),
    hoursPerWeek: 32,
  },
  {
    id: 'a15',
    resourceId: 'r4', // Sam Rivera — Kubernetes
    taskId: 't14',
    projectId: 'p3',
    startDate: d(3),
    endDate: d(6),
    hoursPerWeek: 28,
  },
  {
    id: 'a16',
    resourceId: 'r14', // Niko Petrov
    taskId: 't15',
    projectId: 'p3',
    startDate: d(0),
    endDate: d(3),
    hoursPerWeek: 16,
  },
  {
    id: 'a17',
    resourceId: 'r11', // Taylor Brooks — validation
    taskId: 't16',
    projectId: 'p3',
    startDate: d(5),
    endDate: d(7),
    hoursPerWeek: 24,
  },
  // ── SecureAuth Overhaul ────────────────────────────────────
  {
    id: 'a18',
    resourceId: 'r4', // Sam Rivera — Java/Go
    taskId: 't22',
    projectId: 'p5',
    startDate: d(0),
    endDate: d(2),
    hoursPerWeek: 28,
  },
  {
    id: 'a19',
    resourceId: 'r5', // Morgan Lee — CONFLICT: Morgan has no Java skill
    taskId: 't22',
    projectId: 'p5',
    startDate: d(0),
    endDate: d(2),
    hoursPerWeek: 20,
  },
  {
    id: 'a20',
    resourceId: 'r14', // Niko Petrov
    taskId: 't23',
    projectId: 'p5',
    startDate: d(2),
    endDate: d(3),
    hoursPerWeek: 24,
  },
  {
    id: 'a21',
    resourceId: 'r13', // Avery Johnson — QA
    taskId: 't24',
    projectId: 'p5',
    startDate: d(3),
    endDate: d(4),
    hoursPerWeek: 20,
  },
  {
    id: 'a22',
    resourceId: 'r9', // Dana Kim — PM
    taskId: 't21',
    projectId: 'p5',
    startDate: d(-1),
    endDate: d(0),
    hoursPerWeek: 16,
  },
];
