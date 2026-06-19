import { useMemo, useEffect } from 'react';
import { Users, FolderKanban, TrendingUp, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { startOfWeek } from 'date-fns';
import { useResourceStore } from '../store/useResourceStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAllocationStore } from '../store/useAllocationStore';
import { KpiCard } from '../components/dashboard/KpiCard';
import { UtilizationHeatmap } from '../components/dashboard/UtilizationHeatmap';
import { InsightsPanel } from '../components/dashboard/InsightsPanel';
import { getResourceHoursInWeek } from '../lib/conflictDetector';
import { detectConflicts } from '../lib/conflictDetector';
import { burnPct, formatCurrency } from '../lib/utils';
import { formatDate } from '../lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

export default function Dashboard() {
  const { resources } = useResourceStore();
  const { projects, tasks } = useProjectStore();
  const { allocations } = useAllocationStore();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const conflicts = useMemo(
    () => detectConflicts(allocations, resources, tasks),
    [allocations, resources, tasks]
  );

  const kpis = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
    const overAllocated = resources.filter((r) => {
      const h = getResourceHoursInWeek(r.id, weekStart, allocations);
      return h > r.weeklyCapacity;
    }).length;
    const totalHours = resources.reduce((s, r) => s + getResourceHoursInWeek(r.id, weekStart, allocations), 0);
    const totalCapacity = resources.reduce((s, r) => s + r.weeklyCapacity, 0);
    const avgUtilization = totalCapacity > 0 ? Math.round((totalHours / totalCapacity) * 100) : 0;

    return { activeProjects, totalBudget, totalSpent, overAllocated, avgUtilization };
  }, [resources, projects, allocations, weekStart]);

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() =>
    projects
      .filter((p) => p.status !== 'completed')
      .map((p) => ({ ...p, daysLeft: differenceInDays(parseISO(p.deadline), new Date()) }))
      .filter((p) => p.daysLeft >= 0 && p.daysLeft <= 60)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5),
    [projects]
  );

  const PRIORITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Total Resources"
          value={resources.length}
          subtitle="Across all teams"
          icon={Users}
          color="indigo"
        />
        <KpiCard
          label="Active Projects"
          value={kpis.activeProjects}
          subtitle={`of ${projects.length} total`}
          icon={FolderKanban}
          color="violet"
        />
        <KpiCard
          label="Avg Utilization"
          value={kpis.avgUtilization}
          suffix="%"
          subtitle="This week"
          icon={Activity}
          color={kpis.avgUtilization > 90 ? 'red' : kpis.avgUtilization > 70 ? 'amber' : 'emerald'}
        />
        <KpiCard
          label="Over-Allocated"
          value={kpis.overAllocated}
          subtitle="Resources this week"
          icon={AlertTriangle}
          color={kpis.overAllocated > 0 ? 'red' : 'emerald'}
        />
        <KpiCard
          label="Budget Burn"
          value={burnPct(kpis.totalSpent, kpis.totalBudget)}
          suffix="%"
          subtitle={`${formatCurrency(kpis.totalSpent)} of ${formatCurrency(kpis.totalBudget)}`}
          icon={DollarSign}
          color={burnPct(kpis.totalSpent, kpis.totalBudget) > 85 ? 'red' : 'sky'}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Heatmap - spans 2 cols */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Utilization Heatmap</h2>
              <p className="text-xs text-muted mt-0.5">Resources × weeks — color shows capacity load</p>
            </div>
          </div>
          <UtilizationHeatmap resources={resources} allocations={allocations} weeks={8} />
        </div>

        {/* Insights panel */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h2 className="section-title">Smart Insights</h2>
          </div>
          <InsightsPanel
            resources={resources}
            projects={projects}
            tasks={tasks}
            allocations={allocations}
            conflicts={conflicts}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Upcoming Deadlines</h2>
          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">No deadlines in the next 60 days</p>
            ) : upcomingDeadlines.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{p.name}</p>
                  <p className="text-xs text-muted">{formatDate(p.deadline)}</p>
                </div>
                <div className={`badge ${p.daysLeft <= 7 ? 'bg-red-500/10 text-red-400 border-red-500/20' : p.daysLeft <= 21 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600/30'}`}>
                  {p.daysLeft === 0 ? 'Today' : `${p.daysLeft}d left`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conflict summary */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Active Conflicts</h2>
            <span className={`badge ${conflicts.length > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {conflicts.length} {conflicts.length === 1 ? 'conflict' : 'conflicts'}
            </span>
          </div>
          <div className="space-y-2">
            {conflicts.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">✓ No conflicts detected</p>
            ) : conflicts.map((c) => (
              <div key={c.id} className={`flex gap-3 p-3 rounded-lg border-l-2 ${c.severity === 'error' ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500 bg-amber-500/5'}`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${c.severity === 'error' ? 'text-red-400' : 'text-amber-400'}`} />
                <div>
                  <p className="text-xs font-medium text-slate-300 capitalize">{c.type.replace('-', ' ')}</p>
                  <p className="text-xs text-muted mt-0.5">{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
