import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine
} from 'recharts';
import { useProjectStore } from '../store/useProjectStore';
import { useResourceStore } from '../store/useResourceStore';
import { useAllocationStore } from '../store/useAllocationStore';
import { burnPct, formatCurrency, cn, getUtilizationClasses } from '../lib/utils';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { startOfWeek } from 'date-fns';
import { getResourceHoursInWeek } from '../lib/conflictDetector';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-slate-100 font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Budget() {
  const { projects } = useProjectStore();
  const { resources } = useResourceStore();
  const { allocations } = useAllocationStore();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  // Per-project budget data
  const projectBudgetData = useMemo(() =>
    projects.map((p) => ({
      name: p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name,
      fullName: p.name,
      budget: p.budget,
      spent: p.spent,
      remaining: p.budget - p.spent,
      burn: burnPct(p.spent, p.budget),
      color: p.color,
    })).sort((a, b) => b.burn - a.burn),
    [projects]
  );

  // Resource cost breakdown (weekly)
  const resourceCostData = useMemo(() => {
    return resources.map((r) => {
      const hours = getResourceHoursInWeek(r.id, weekStart, allocations);
      const weeklyCost = hours * r.hourlyCost;
      return {
        name: r.name.split(' ')[0],
        fullName: r.name,
        weeklyCost,
        hourlyRate: r.hourlyCost,
        hours,
        role: r.role,
      };
    })
    .filter((r) => r.weeklyCost > 0)
    .sort((a, b) => b.weeklyCost - a.weeklyCost)
    .slice(0, 10);
  }, [resources, allocations, weekStart]);

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overBudget = projects.filter((p) => p.spent > p.budget);

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          Budget Tracking
        </h1>
        <p className="text-sm text-muted mt-0.5">Portfolio-level budget overview and burn analysis</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: formatCurrency(totalBudget), color: 'text-slate-100', bg: 'bg-slate-800/50' },
          { label: 'Total Spent', value: formatCurrency(totalSpent), color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
          { label: 'Remaining', value: formatCurrency(totalRemaining), color: totalRemaining < 0 ? 'text-red-400' : 'text-emerald-400', bg: totalRemaining < 0 ? 'bg-red-500/5' : 'bg-emerald-500/5' },
          { label: 'Burn Rate', value: `${burnPct(totalSpent, totalBudget)}%`, color: burnPct(totalSpent, totalBudget) > 80 ? 'text-red-400' : 'text-amber-400', bg: 'bg-amber-500/5' },
        ].map((s) => (
          <div key={s.label} className={cn('card p-4', s.bg)}>
            <p className="label mb-1">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Over-budget alerts */}
      {overBudget.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400 mb-1">{overBudget.length} project{overBudget.length > 1 ? 's' : ''} over budget</p>
            <p className="text-xs text-slate-400">{overBudget.map((p) => p.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Budget vs Spent bars */}
        <div className="card p-5">
          <h2 className="section-title mb-1">Budget vs Spent by Project</h2>
          <p className="text-xs text-muted mb-5">Sorted by burn rate (highest first)</p>
          <div className="space-y-3">
            {projectBudgetData.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-300 truncate max-w-[60%]">{p.fullName}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted">{formatCurrency(p.spent)} / {formatCurrency(p.budget)}</span>
                    <span className={cn('font-semibold', p.burn > 100 ? 'text-red-400' : p.burn > 80 ? 'text-amber-400' : 'text-emerald-400')}>
                      {p.burn}%
                    </span>
                  </div>
                </div>
                <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  {/* Budget bar (ghost) */}
                  <div className="absolute inset-0 opacity-20 rounded-full" style={{ background: p.color }} />
                  {/* Spent bar */}
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(p.burn, 100)}%`,
                      background: p.burn > 100 ? '#ef4444' : p.burn > 80 ? '#f59e0b' : p.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly resource cost breakdown */}
        <div className="card p-5">
          <h2 className="section-title mb-1">Weekly Resource Cost</h2>
          <p className="text-xs text-muted mb-5">Top 10 allocated resources by current weekly cost</p>
          {resourceCostData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted text-sm">No active allocations this week</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={resourceCostData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
                        <p className="font-semibold text-slate-100 mb-1">{d.fullName}</p>
                        <p className="text-muted">{d.hours}h × ${d.hourlyRate}/hr = <span className="text-emerald-400 font-semibold">{formatCurrency(d.weeklyCost)}/wk</span></p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="weeklyCost" radius={[0, 4, 4, 0]} name="Weekly Cost">
                  {resourceCostData.map((entry, i) => (
                    <Cell key={i} fill="#6366f1" fillOpacity={0.7 + (i / resourceCostData.length) * 0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Project detail table */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Project Budget Detail</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                {['Project', 'Priority', 'Status', 'Budget', 'Spent', 'Remaining', 'Burn Rate'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const burn = burnPct(p.spent, p.budget);
                return (
                  <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <span className="text-slate-200 font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('badge capitalize', {
                        critical: 'bg-red-500/10 text-red-400 border-red-500/20',
                        high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                        medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                        low: 'bg-green-500/10 text-green-400 border-green-500/20',
                      }[p.priority])}>{p.priority}</span>
                    </td>
                    <td className="px-3 py-3 capitalize text-slate-400">{p.status}</td>
                    <td className="px-3 py-3 text-slate-300">{formatCurrency(p.budget)}</td>
                    <td className="px-3 py-3 text-slate-300">{formatCurrency(p.spent)}</td>
                    <td className={cn('px-3 py-3 font-medium', p.budget - p.spent < 0 ? 'text-red-400' : 'text-emerald-400')}>
                      {formatCurrency(Math.abs(p.budget - p.spent))} {p.budget - p.spent < 0 ? 'over' : 'left'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(burn, 100)}%`, background: burn > 90 ? '#ef4444' : burn > 75 ? '#f59e0b' : '#22c55e' }}
                          />
                        </div>
                        <span className={cn('font-semibold', burn > 90 ? 'text-red-400' : burn > 75 ? 'text-amber-400' : 'text-emerald-400')}>{burn}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
