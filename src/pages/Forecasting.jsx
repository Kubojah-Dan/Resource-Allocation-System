import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts';
import { format, addWeeks } from 'date-fns';
import { useResourceStore } from '../store/useResourceStore';
import { useAllocationStore } from '../store/useAllocationStore';
import { generateForecast, generateTeamForecast, detectBottlenecks, simulateWhatIf } from '../lib/forecastEngine';
import { cn, avatarColor, getUtilizationHex } from '../lib/utils';
import { TrendingUp, AlertTriangle, Users, Zap, RotateCcw } from 'lucide-react';
import { generateId } from '../lib/utils';

const TEAM_COLORS = {
  Engineering: '#6366f1',
  Design: '#8b5cf6',
  Product: '#0ea5e9',
  QA: '#22c55e',
  Infrastructure: '#f97316',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-slate-100 font-semibold">{Math.round(p.value)}%</span>
        </div>
      ))}
    </div>
  );
};

export default function Forecasting() {
  const { resources } = useResourceStore();
  const { allocations } = useAllocationStore();
  const [weekCount, setWeekCount] = useState(8);
  const [viewMode, setViewMode] = useState('team'); // 'team' | 'individual'
  const [selectedResource, setSelectedResource] = useState(null);
  const [simAlloc, setSimAlloc] = useState(null);
  const [simRemoveId, setSimRemoveId] = useState(null);

  const teamForecast = useMemo(() => generateTeamForecast(resources, allocations, weekCount), [resources, allocations, weekCount]);
  const individualForecast = useMemo(() => generateForecast(resources, allocations, weekCount), [resources, allocations, weekCount]);
  const bottlenecks = useMemo(() => detectBottlenecks(individualForecast), [individualForecast]);

  // Simulated forecast
  const simForecast = useMemo(() => {
    if (!simAlloc && !simRemoveId) return null;
    return generateForecast(resources, allocations, weekCount);
  }, [simAlloc, simRemoveId, resources, allocations, weekCount]);

  // Chart data — team view
  const teamChartData = useMemo(() =>
    teamForecast.map((w) => {
      const row = { week: format(w.week, 'MMM d') };
      Object.entries(w.teams).forEach(([dept, t]) => { row[dept] = t.utilization; });
      return row;
    }), [teamForecast]);

  // Chart data — individual view
  const selectedResData = useMemo(() => {
    if (!selectedResource) return [];
    return individualForecast.map((w) => {
      const r = w.data.find((d) => d.resourceId === selectedResource);
      return { week: format(w.week, 'MMM d'), utilization: r?.utilization || 0 };
    });
  }, [individualForecast, selectedResource]);

  const departments = [...new Set(resources.map((r) => r.department))];
  const uniqueBottleneckResources = [...new Set(bottlenecks.map((b) => b.resourceId))];

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Capacity Forecasting
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {bottlenecks.length > 0
              ? <span className="text-amber-400">{uniqueBottleneckResources.length} resource{uniqueBottleneckResources.length > 1 ? 's' : ''} over capacity in forecast period</span>
              : 'Projected utilization over the next several weeks'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700/50">
            {['team', 'individual'].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize',
                  viewMode === m ? 'bg-slate-700 text-slate-100' : 'text-muted hover:text-slate-300')}
              >
                {m}
              </button>
            ))}
          </div>
          <select
            value={weekCount}
            onChange={(e) => setWeekCount(+e.target.value)}
            className="input-base py-1.5 text-xs"
          >
            <option value={4}>4 weeks</option>
            <option value={8}>8 weeks</option>
            <option value={12}>12 weeks</option>
          </select>
        </div>
      </div>

      {/* Bottleneck warnings */}
      {bottlenecks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {bottlenecks.slice(0, 6).map((b, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{b.name}</p>
                <p className="text-xs text-red-400">{b.utilization}% utilization — week of {format(b.week, 'MMM d')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main chart */}
        <div className="xl:col-span-2 card p-5">
          <h2 className="section-title mb-1">
            {viewMode === 'team' ? 'Team Utilization by Week' : 'Individual Utilization'}
          </h2>
          <p className="text-xs text-muted mb-5">Projected capacity usage — dashed line = 100% (full capacity)</p>

          {viewMode === 'team' ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={teamChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  {departments.map((dept) => (
                    <linearGradient key={dept} id={`grad-${dept}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEAM_COLORS[dept] || '#6366f1'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={TEAM_COLORS[dept] || '#6366f1'} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 130]} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '100%', fill: '#ef4444', fontSize: 10 }} />
                {departments.map((dept) => (
                  <Area
                    key={dept}
                    type="monotone"
                    dataKey={dept}
                    stroke={TEAM_COLORS[dept] || '#6366f1'}
                    strokeWidth={2}
                    fill={`url(#grad-${dept})`}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="space-y-4">
              {/* Resource selector */}
              <select
                value={selectedResource || ''}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="input-base text-xs"
              >
                <option value="">Select a resource…</option>
                {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              {selectedResource && selectedResData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={selectedResData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 130]} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="utilization" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} name="Utilization" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted text-sm">
                  Select a resource to see their forecast
                </div>
              )}
            </div>
          )}
        </div>

        {/* What-If Simulator */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h2 className="section-title">What-If Simulator</h2>
          </div>
          <p className="text-xs text-muted mb-4">Preview the impact of removing an allocation before committing</p>

          <div className="space-y-4">
            <div>
              <label className="label block mb-1.5">Select Allocation to Remove</label>
              <select
                value={simRemoveId || ''}
                onChange={(e) => setSimRemoveId(e.target.value || null)}
                className="input-base w-full text-xs"
              >
                <option value="">Choose an allocation…</option>
                {allocations.slice(0, 20).map((a) => {
                  const res = resources.find((r) => r.id === a.resourceId);
                  return (
                    <option key={a.id} value={a.id}>
                      {res?.name?.split(' ')[0]} — {a.hoursPerWeek}h/wk
                    </option>
                  );
                })}
              </select>
            </div>

            {simRemoveId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
              >
                <p className="text-xs text-indigo-300 font-medium mb-2">Simulation Active</p>
                {(() => {
                  const removedAlloc = allocations.find((a) => a.id === simRemoveId);
                  if (!removedAlloc) return null;
                  const res = resources.find((r) => r.id === removedAlloc.resourceId);
                  const simData = simulateWhatIf(allocations, null, simRemoveId, resources, weekCount);
                  const resSimData = simData.map((w) => {
                    const d = w.data.find((x) => x.resourceId === removedAlloc.resourceId);
                    return { week: format(w.week, 'MMM d'), util: d?.utilization || 0 };
                  });
                  const origData = individualForecast.map((w) => {
                    const d = w.data.find((x) => x.resourceId === removedAlloc.resourceId);
                    return d?.utilization || 0;
                  });
                  const simVals = resSimData.map((d) => d.util);
                  const delta = Math.round(origData.reduce((s, v) => s + v, 0) / origData.length) -
                    Math.round(simVals.reduce((s, v) => s + v, 0) / simVals.length);
                  return (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-300">Removing {removedAlloc.hoursPerWeek}h/wk from <strong>{res?.name}</strong></p>
                      <p className="text-emerald-400">Average utilization drops by ~{Math.abs(delta)}%</p>
                      <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={resSimData}>
                          <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis hide domain={[0, 130]} />
                          <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" />
                          <Line type="monotone" dataKey="util" stroke="#22c55e" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            <button
              onClick={() => { setSimRemoveId(null); setSimAlloc(null); }}
              className="btn-ghost text-xs flex items-center gap-1.5 w-full justify-center"
            >
              <RotateCcw className="w-3 h-3" /> Reset Simulation
            </button>
          </div>

          {/* Summary stats */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <p className="label">Team Summary</p>
            {departments.map((dept) => {
              const deptResources = resources.filter((r) => r.department === dept);
              const latestWeek = teamForecast[0];
              const teamData = latestWeek?.teams[dept];
              if (!teamData) return null;
              return (
                <div key={dept} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TEAM_COLORS[dept] || '#6366f1' }} />
                  <span className="text-xs text-slate-400 flex-1">{dept}</span>
                  <span className={cn('text-xs font-semibold', teamData.utilization > 100 ? 'text-red-400' : teamData.utilization >= 80 ? 'text-amber-400' : 'text-emerald-400')}>
                    {teamData.utilization}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
