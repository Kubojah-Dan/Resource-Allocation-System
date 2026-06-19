import { useDroppable } from '@dnd-kit/core';
import { cn, avatarColor, getUtilizationClasses } from '../../lib/utils';
import { TaskBlock } from './TaskBlock';
import { CapacityBar } from './CapacityBar';
import { ROLE_LABELS } from '../../types/index';
import { getResourceHoursInWeek } from '../../lib/conflictDetector';
import { isWithinInterval, parseISO } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

export function ResourceRow({ resource, weekDates, allocations, taskMap, projectMap, conflicts, onTaskClick }) {
  const hasConflict = conflicts.some((c) => c.resourceId === resource.id);

  return (
    <div className="flex border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
      {/* Resource label */}
      <div className="w-44 flex-shrink-0 p-3 flex flex-col gap-2 border-r border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0', avatarColor(resource.name))}>
            {resource.avatar}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-slate-200 truncate">{resource.name.split(' ')[0]}</span>
              {hasConflict && <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />}
            </div>
            <span className="text-[10px] text-slate-500">{ROLE_LABELS[resource.role] || resource.role}</span>
          </div>
        </div>
        <CapacityBar
          resource={resource}
          allocations={allocations}
          weekStart={weekDates[0]}
        />
      </div>

      {/* Week cells */}
      {weekDates.map((weekStart, wi) => {
        const weekAllocations = allocations.filter((a) => {
          if (a.resourceId !== resource.id) return false;
          const s = parseISO(a.startDate);
          const e = parseISO(a.endDate);
          const wEnd = new Date(weekStart.getTime() + 6 * 86400000);
          return s < wEnd && e > weekStart;
        });

        const dropId = `${resource.id}-week-${wi}`;
        const { setNodeRef, isOver } = useDroppable({ id: dropId, data: { resourceId: resource.id, weekStart } });

        return (
          <div
            key={wi}
            ref={setNodeRef}
            className={cn(
              'flex-1 min-w-[120px] p-1.5 border-r border-slate-800/40 transition-colors space-y-1',
              isOver ? 'bg-indigo-500/10 border-indigo-500/30' : ''
            )}
          >
            {weekAllocations.map((a) => (
              <TaskBlock
                key={a.id}
                allocation={a}
                task={taskMap[a.taskId]}
                project={projectMap[a.projectId]}
                onClick={onTaskClick}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
