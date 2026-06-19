import { useMemo } from 'react';
import { cn, getUtilizationClasses } from '../../lib/utils';
import { getResourceHoursInWeek } from '../../lib/conflictDetector';

export function CapacityBar({ resource, allocations, weekStart }) {
  const hours = getResourceHoursInWeek(resource.id, weekStart, allocations);
  const pct = resource.weeklyCapacity > 0 ? Math.round((hours / resource.weeklyCapacity) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-0.5">
        <span className={cn('text-[9px] font-semibold', pct > 100 ? 'text-red-400' : pct >= 80 ? 'text-amber-400' : 'text-emerald-400')}>
          {pct}%
        </span>
        <span className="text-[9px] text-slate-600">{hours}h</span>
      </div>
      <div className="h-1 bg-slate-700/40 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', getUtilizationClasses(pct))}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
