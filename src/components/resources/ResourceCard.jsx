import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock, Star, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { cn, avatarColor, proficiencyLabel, getUtilizationClasses } from '../../lib/utils';
import { getResourceHoursInWeek } from '../../lib/conflictDetector';
import { startOfWeek } from 'date-fns';
import { ROLE_LABELS } from '../../types/index';

const ROLE_COLORS = {
  engineer: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  designer: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  pm: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  qa: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  devops: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export function ResourceCard({ resource, allocations, onEdit, onDelete, canWrite, canDelete }) {
  const [expanded, setExpanded] = useState(false);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const hours = getResourceHoursInWeek(resource.id, weekStart, allocations);
  const utilPct = Math.round((hours / resource.weeklyCapacity) * 100);

  const AVAIL_COLORS = {
    'available': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'partially-available': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'unavailable': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card card-hover p-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
          avatarColor(resource.name)
        )}>
          {resource.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-100">{resource.name}</h3>
            <span className={cn('badge', ROLE_COLORS[resource.role] || 'bg-slate-700/50 text-slate-400 border-slate-600/30')}>
              {ROLE_LABELS[resource.role] || resource.role}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{resource.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />${resource.hourlyCost}/hr
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{resource.weeklyCapacity}h/wk
            </span>
          </div>
        </div>
        {canWrite && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onEdit(resource)} className="btn-ghost p-1.5 rounded-md" title="Edit">
              <Edit className="w-3.5 h-3.5" />
            </button>
            {canDelete && (
              <button onClick={() => onDelete(resource.id)} className="btn-ghost p-1.5 rounded-md text-red-400 hover:bg-red-500/10" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Utilization bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted">This week</span>
          <span className={cn('text-[10px] font-semibold', utilPct > 100 ? 'text-red-400' : utilPct >= 80 ? 'text-amber-400' : 'text-emerald-400')}>
            {hours}h / {resource.weeklyCapacity}h ({utilPct}%)
          </span>
        </div>
        <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', getUtilizationClasses(utilPct))}
            style={{ width: `${Math.min(utilPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Skills preview */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {resource.skills.slice(0, expanded ? undefined : 3).map((skill) => (
          <div key={skill.name} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/50 text-xs text-slate-300 border border-slate-600/30">
            <span>{skill.name}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={cn('w-1 h-1 rounded-full', i < skill.proficiency ? 'bg-indigo-400' : 'bg-slate-600')} />
              ))}
            </div>
          </div>
        ))}
        {resource.skills.length > 3 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-800 text-xs text-muted hover:text-slate-100 transition-colors"
          >
            {expanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>+{resource.skills.length - 3} more <ChevronDown className="w-3 h-3" /></>}
          </button>
        )}
      </div>

      {/* Availability */}
      <div className="mt-3 flex items-center justify-between">
        <span className={cn('badge', AVAIL_COLORS[resource.availability] || '')}>
          {resource.availability.replace('-', ' ')}
        </span>
        <span className="text-xs text-muted">{resource.department}</span>
      </div>
    </motion.div>
  );
}
