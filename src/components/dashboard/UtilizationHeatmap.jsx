import { useMemo } from 'react';
import { startOfWeek, addWeeks, format } from 'date-fns';
import { getResourceHoursInWeek } from '../../lib/conflictDetector';
import { getUtilizationHex, cn } from '../../lib/utils';
import { Tooltip } from '../shared/Tooltip';

export function UtilizationHeatmap({ resources, allocations, weeks = 8 }) {
  const base = startOfWeek(new Date(), { weekStartsOn: 1 });

  const weekDates = useMemo(
    () => Array.from({ length: weeks }, (_, i) => addWeeks(base, i - 1)),
    [weeks]
  );

  const data = useMemo(() =>
    resources.slice(0, 12).map((r) => ({
      resource: r,
      weeks: weekDates.map((wd) => {
        const hours = getResourceHoursInWeek(r.id, wd, allocations);
        const pct = Math.round((hours / r.weeklyCapacity) * 100);
        return { date: wd, hours, pct };
      }),
    })),
    [resources, allocations, weekDates]
  );

  function cellColor(pct) {
    if (pct === 0) return 'bg-slate-800/50';
    if (pct > 100) return 'bg-red-500/80';
    if (pct >= 80) return 'bg-amber-500/70';
    if (pct >= 50) return 'bg-emerald-500/60';
    return 'bg-emerald-500/30';
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Week headers */}
        <div className="flex items-center mb-2 ml-32">
          {weekDates.map((wd, i) => (
            <div key={i} className="w-10 text-center">
              <span className="text-[10px] text-slate-500 font-medium">
                {format(wd, 'M/d')}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {data.map(({ resource, weeks: wks }) => (
          <div key={resource.id} className="flex items-center gap-1 mb-1">
            <div className="w-32 flex items-center gap-2 pr-2 flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-[10px] text-indigo-300 font-bold flex-shrink-0">
                {resource.avatar}
              </div>
              <span className="text-xs text-slate-400 truncate">{resource.name.split(' ')[0]}</span>
            </div>
            {wks.map(({ date, hours, pct }, i) => (
              <div
                key={i}
                className={cn(
                  'w-10 h-7 rounded flex items-center justify-center text-[10px] font-medium cursor-default transition-transform hover:scale-110',
                  cellColor(pct),
                  pct > 0 ? (pct > 100 ? 'text-red-100' : 'text-slate-100') : 'text-slate-700'
                )}
                title={`${resource.name}: ${hours}h/${resource.weeklyCapacity}h (${pct}%) — Week of ${format(date, 'MMM d')}`}
              >
                {pct > 0 ? `${Math.min(pct, 999)}%` : '—'}
              </div>
            ))}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 ml-32">
          {[
            { color: 'bg-slate-800/50', label: '0%' },
            { color: 'bg-emerald-500/30', label: '1–49%' },
            { color: 'bg-emerald-500/60', label: '50–79%' },
            { color: 'bg-amber-500/70', label: '80–100%' },
            { color: 'bg-red-500/80', label: '>100%' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={cn('w-4 h-3 rounded', l.color)} />
              <span className="text-[10px] text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
