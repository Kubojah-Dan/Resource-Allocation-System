import { useState, useMemo } from 'react';
import { useResourceStore } from '../store/useResourceStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAllocationStore } from '../store/useAllocationStore';
import { BarChart3, Download, Calendar, Users, FolderKanban } from 'lucide-react';
import { formatDate, formatCurrency, burnPct, cn } from '../lib/utils';
import { startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO, format, subWeeks } from 'date-fns';
import { getResourceHoursInWeek } from '../lib/conflictDetector';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

function downloadCSV(filename, headers, rows) {
  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { resources } = useResourceStore();
  const { projects, tasks } = useProjectStore();
  const { allocations } = useAllocationStore();

  const [activeReport, setActiveReport] = useState('utilization');
  const [weeksBack, setWeeksBack] = useState(4);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  // ── Utilization report data ──────────────────────────────
  const utilizationData = useMemo(() =>
    resources.map((r) => {
      const hours = getResourceHoursInWeek(r.id, weekStart, allocations);
      const utilPct = Math.round((hours / r.weeklyCapacity) * 100);
      return {
        name: r.name,
        role: r.role,
        department: r.department,
        weeklyCapacity: r.weeklyCapacity,
        allocatedHours: hours,
        utilizationPct: utilPct,
        hourlyCost: r.hourlyCost,
        weeklyCost: hours * r.hourlyCost,
      };
    }).sort((a, b) => b.utilizationPct - a.utilizationPct),
    [resources, allocations, weekStart]
  );

  // ── Budget report data ───────────────────────────────────
  const budgetData = useMemo(() =>
    projects.map((p) => ({
      name: p.name,
      priority: p.priority,
      status: p.status,
      budget: p.budget,
      spent: p.spent,
      remaining: p.budget - p.spent,
      burnPct: burnPct(p.spent, p.budget),
      deadline: p.deadline,
      taskCount: tasks.filter((t) => t.projectId === p.id).length,
    })).sort((a, b) => b.burnPct - a.burnPct),
    [projects, tasks]
  );

  const exportUtilization = () => {
    downloadCSV(
      `utilization-report-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      ['Name', 'Role', 'Department', 'Capacity (h/wk)', 'Allocated (h/wk)', 'Utilization (%)', 'Hourly Rate ($)', 'Weekly Cost ($)'],
      utilizationData.map((r) => [r.name, r.role, r.department, r.weeklyCapacity, r.allocatedHours, r.utilizationPct, r.hourlyCost, r.weeklyCost])
    );
  };

  const exportBudget = () => {
    downloadCSV(
      `budget-report-${format(new Date(), 'yyyy-MM-dd')}.csv`,
      ['Project', 'Priority', 'Status', 'Budget ($)', 'Spent ($)', 'Remaining ($)', 'Burn Rate (%)', 'Deadline', 'Task Count'],
      budgetData.map((p) => [p.name, p.priority, p.status, p.budget, p.spent, p.remaining, p.burnPct, formatDate(p.deadline), p.taskCount])
    );
  };

  const TABS = [
    { id: 'utilization', label: 'Utilization', icon: Users },
    { id: 'budget', label: 'Budget', icon: FolderKanban },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted mt-0.5">Exportable reports for utilization and budget</p>
        </div>
        <button
          onClick={activeReport === 'utilization' ? exportUtilization : exportBudget}
          id="export-csv-btn"
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveReport(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeReport === id ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-muted hover:text-slate-300'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Utilization Report */}
      {activeReport === 'utilization' && (
        <div className="space-y-5">
          {/* Chart */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Utilization by Resource</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={utilizationData.slice(0, 12)} margin={{ top: 0, right: 20, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" domain={[0, 130]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
                        <p className="font-semibold text-slate-100 mb-1">{d.name}</p>
                        <p className="text-muted">{d.allocatedHours}h / {d.weeklyCapacity}h = <span className="text-indigo-400 font-semibold">{d.utilizationPct}%</span></p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="utilizationPct" radius={[4, 4, 0, 0]} name="Utilization %">
                  {utilizationData.slice(0, 12).map((r, i) => (
                    <Cell
                      key={i}
                      fill={r.utilizationPct > 100 ? '#ef4444' : r.utilizationPct >= 80 ? '#f59e0b' : '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Full Utilization Table</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Resource', 'Role', 'Dept', 'Capacity', 'Allocated', 'Utilization', 'Rate', 'Weekly Cost'].map((h) => (
                      <th key={h} className="text-left px-3 py-2 text-muted font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {utilizationData.map((r) => (
                    <tr key={r.name} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-3 py-2.5 text-slate-200 font-medium">{r.name}</td>
                      <td className="px-3 py-2.5 text-slate-400 capitalize">{r.role}</td>
                      <td className="px-3 py-2.5 text-slate-400">{r.department}</td>
                      <td className="px-3 py-2.5 text-slate-300">{r.weeklyCapacity}h</td>
                      <td className="px-3 py-2.5 text-slate-300">{r.allocatedHours}h</td>
                      <td className="px-3 py-2.5">
                        <span className={cn('font-semibold', r.utilizationPct > 100 ? 'text-red-400' : r.utilizationPct >= 80 ? 'text-amber-400' : 'text-emerald-400')}>
                          {r.utilizationPct}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">${r.hourlyCost}/hr</td>
                      <td className="px-3 py-2.5 text-slate-300">{formatCurrency(r.weeklyCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Budget Report */}
      {activeReport === 'budget' && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Project Budget Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Project', 'Priority', 'Status', 'Budget', 'Spent', 'Remaining', 'Burn', 'Deadline', 'Tasks'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {budgetData.map((p) => (
                  <tr key={p.name} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-2.5 text-slate-200 font-medium max-w-[200px]">
                      <span className="line-clamp-1">{p.name}</span>
                    </td>
                    <td className="px-3 py-2.5 capitalize text-slate-400">{p.priority}</td>
                    <td className="px-3 py-2.5 capitalize text-slate-400">{p.status}</td>
                    <td className="px-3 py-2.5 text-slate-300">{formatCurrency(p.budget)}</td>
                    <td className="px-3 py-2.5 text-slate-300">{formatCurrency(p.spent)}</td>
                    <td className={cn('px-3 py-2.5 font-medium', p.remaining < 0 ? 'text-red-400' : 'text-emerald-400')}>
                      {p.remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(p.remaining))}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(p.burnPct, 100)}%`, background: p.burnPct > 90 ? '#ef4444' : p.burnPct > 75 ? '#f59e0b' : '#22c55e' }} />
                        </div>
                        <span className={cn('font-semibold', p.burnPct > 90 ? 'text-red-400' : p.burnPct > 75 ? 'text-amber-400' : 'text-emerald-400')}>{p.burnPct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">{formatDate(p.deadline, 'MMM d')}</td>
                    <td className="px-3 py-2.5 text-slate-300">{p.taskCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
