import { motion } from 'framer-motion';
import { Check, X, User, Star, Zap, DollarSign, Activity } from 'lucide-react';
import { useAllocationStore } from '../../store/useAllocationStore';
import { cn, avatarColor, formatCurrency } from '../../lib/utils';
import { format, addWeeks, startOfWeek } from 'date-fns';
import { toast } from 'sonner';

export function SuggestionCard({ suggestion }) {
  const { task, suggestions } = suggestion;
  const { acceptSuggestion, rejectSuggestion } = useAllocationStore();

  const top = suggestions[0];
  if (!top) return null;

  const matchPct = Math.round(top.score * 100);
  const matchColor = matchPct >= 80 ? 'text-emerald-400' : matchPct >= 60 ? 'text-amber-400' : 'text-red-400';

  const handleAccept = () => {
    const now = startOfWeek(new Date(), { weekStartsOn: 1 });
    acceptSuggestion(task.id, top.resource.id, {
      projectId: task.projectId,
      startDate: format(now, 'yyyy-MM-dd'),
      endDate: format(addWeeks(now, Math.ceil(task.estimatedHours / 20)), 'yyyy-MM-dd'),
      hoursPerWeek: Math.min(20, top.resource.weeklyCapacity),
    });
    toast.success(`Assigned ${top.resource.name} to "${task.name}"`);
  };

  const handleReject = () => {
    rejectSuggestion(task.id);
    toast.info('Suggestion dismissed');
  };

  const BREAKDOWN_ICONS = { skill: Star, availability: Activity, cost: DollarSign, workload: Zap };
  const BREAKDOWN_LABELS = { skill: 'Skill Match', availability: 'Availability', cost: 'Cost Efficiency', workload: 'Workload Balance' };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="card p-4 border-l-2 border-l-indigo-500"
    >
      {/* Task info */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs text-muted mb-0.5">Suggestion for</p>
          <h4 className="text-sm font-semibold text-slate-100">{task.name}</h4>
          <p className="text-xs text-muted">{task.estimatedHours}h · {task.requiredSkills.join(', ')}</p>
        </div>
        <div className="text-right">
          <div className={cn('text-2xl font-bold', matchColor)}>{matchPct}%</div>
          <div className="text-[10px] text-muted">match score</div>
        </div>
      </div>

      {/* Top candidate */}
      <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0', avatarColor(top.resource.name))}>
          {top.resource.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100">{top.resource.name}</p>
          <p className="text-xs text-muted">{top.resource.role} · {formatCurrency(top.resource.hourlyCost)}/hr</p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-1.5 mb-3">
        {Object.entries(top.breakdown).map(([key, val]) => {
          const Icon = BREAKDOWN_ICONS[key] || Star;
          return (
            <div key={key} className="flex items-center gap-2">
              <Icon className="w-3 h-3 text-muted flex-shrink-0" />
              <span className="text-[10px] text-muted w-20 flex-shrink-0">{BREAKDOWN_LABELS[key]}</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', val >= 0.7 ? 'bg-emerald-500' : val >= 0.4 ? 'bg-amber-500' : 'bg-red-500')}
                  style={{ width: `${Math.round(val * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted w-8 text-right">{Math.round(val * 100)}%</span>
            </div>
          );
        })}
      </div>

      {/* Reason tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {top.reasons.map((r) => (
          <span key={r} className="px-2 py-0.5 bg-slate-700/50 text-[10px] text-slate-400 rounded-full border border-slate-600/30">{r}</span>
        ))}
      </div>

      {/* Other candidates count */}
      {suggestions.length > 1 && (
        <p className="text-[10px] text-muted mb-3">+{suggestions.length - 1} other candidate{suggestions.length > 2 ? 's' : ''}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleReject} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs">
          <X className="w-3.5 h-3.5" /> Dismiss
        </button>
        <button onClick={handleAccept} className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs">
          <Check className="w-3.5 h-3.5" /> Accept
        </button>
      </div>
    </motion.div>
  );
}
