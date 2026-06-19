import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, Users, Clock, CheckCircle, Lightbulb } from 'lucide-react';
import { startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO, differenceInDays, parseJSON } from 'date-fns';
import { getResourceHoursInWeek } from '../../lib/conflictDetector';
import { formatDate, burnPct } from '../../lib/utils';
import { cn } from '../../lib/utils';

export function InsightsPanel({ resources, projects, tasks, allocations, conflicts }) {
  const insights = useMemo(() => {
    const result = [];
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    // 1. Over-allocated resources
    const overAllocated = resources.filter((r) => {
      const hours = getResourceHoursInWeek(r.id, weekStart, allocations);
      return hours > r.weeklyCapacity;
    });
    if (overAllocated.length > 0) {
      result.push({
        type: 'error',
        icon: AlertTriangle,
        text: `${overAllocated.length} resource${overAllocated.length > 1 ? 's are' : ' is'} over-allocated this week: ${overAllocated.map(r => r.name.split(' ')[0]).join(', ')}`,
      });
    }

    // 2. Under-utilized resources
    const underUtilized = resources.filter((r) => {
      const hours = getResourceHoursInWeek(r.id, weekStart, allocations);
      return hours === 0;
    });
    if (underUtilized.length > 0) {
      result.push({
        type: 'info',
        icon: Users,
        text: `${underUtilized.length} resource${underUtilized.length > 1 ? 's have' : ' has'} no allocations this week — consider assigning them to active tasks`,
      });
    }

    // 3. Approaching deadlines
    const urgentProjects = projects.filter((p) => {
      const diff = differenceInDays(parseISO(p.deadline), now);
      return diff >= 0 && diff <= 21 && p.status !== 'completed';
    });
    if (urgentProjects.length > 0) {
      result.push({
        type: 'warning',
        icon: Clock,
        text: `${urgentProjects.length} project${urgentProjects.length > 1 ? 's are' : ' is'} due within 3 weeks: ${urgentProjects.map(p => p.name).join(', ')}`,
      });
    }

    // 4. Skill mismatch conflicts
    const skillConflicts = conflicts.filter((c) => c.type === 'skill-mismatch');
    if (skillConflicts.length > 0) {
      result.push({
        type: 'warning',
        icon: AlertTriangle,
        text: `${skillConflicts.length} skill mismatch${skillConflicts.length > 1 ? 'es' : ''} detected — some resources are assigned tasks outside their skill set`,
      });
    }

    // 5. Budget alerts
    const highBurnProjects = projects.filter((p) => burnPct(p.spent, p.budget) > 80 && p.status !== 'completed');
    if (highBurnProjects.length > 0) {
      result.push({
        type: 'warning',
        icon: TrendingUp,
        text: `${highBurnProjects.length} project${highBurnProjects.length > 1 ? 's are' : ' is'} above 80% budget: ${highBurnProjects.map(p => p.name).join(', ')}`,
      });
    }

    // 6. Unassigned critical tasks
    const criticalUnassigned = tasks.filter((t) => {
      const isAssigned = allocations.some((a) => a.taskId === t.id);
      return !isAssigned && t.priority === 'critical' && t.status !== 'done';
    });
    if (criticalUnassigned.length > 0) {
      result.push({
        type: 'error',
        icon: AlertTriangle,
        text: `${criticalUnassigned.length} critical task${criticalUnassigned.length > 1 ? 's are' : ' is'} unassigned — use Auto-Allocate to find the best fit`,
      });
    }

    // 7. Positive: all clear
    if (result.length === 0) {
      result.push({
        type: 'success',
        icon: CheckCircle,
        text: 'All resources are within capacity and no conflicts detected. Team is well-balanced!',
      });
    }

    return result;
  }, [resources, projects, tasks, allocations, conflicts]);

  const typeStyles = {
    error: 'border-l-red-500 bg-red-500/5',
    warning: 'border-l-amber-500 bg-amber-500/5',
    info: 'border-l-indigo-500 bg-indigo-500/5',
    success: 'border-l-emerald-500 bg-emerald-500/5',
  };
  const iconStyles = {
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-indigo-400',
    success: 'text-emerald-400',
  };

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => {
        const Icon = insight.icon;
        return (
          <div
            key={i}
            className={cn('flex gap-3 p-3 rounded-lg border-l-2', typeStyles[insight.type])}
          >
            <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', iconStyles[insight.type])} />
            <p className="text-sm text-slate-300 leading-relaxed">{insight.text}</p>
          </div>
        );
      })}
    </div>
  );
}
