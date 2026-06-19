import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, DollarSign, Edit, Trash2, Plus, CheckCircle, Clock, CircleDot } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { useAllocationStore } from '../../store/useAllocationStore';
import { cn, formatDate, formatCurrency, burnPct, getPriorityClasses, getStatusClasses } from '../../lib/utils';

const TASK_STATUS_ICONS = { done: CheckCircle, 'in-progress': Clock, todo: CircleDot };
const TASK_STATUS_COLORS = { done: 'text-emerald-400', 'in-progress': 'text-indigo-400', todo: 'text-slate-500' };

export function ProjectCard({ project, tasks, onEdit, onDelete, onAddTask, onEditTask, canWrite, canDelete }) {
  const [expanded, setExpanded] = useState(false);
  const { allocations } = useAllocationStore();
  const burn = burnPct(project.spent, project.budget);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const assignedCount = projectTasks.filter((t) => allocations.some((a) => a.taskId === t.id)).length;
  const doneCount = projectTasks.filter((t) => t.status === 'done').length;
  const progress = projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
      {/* Color bar */}
      <div className="h-1 w-full" style={{ background: project.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-100">{project.name}</h3>
              <span className={cn('badge', getPriorityClasses(project.priority))}>{project.priority}</span>
              <span className={cn('badge', getStatusClasses(project.status))}>{project.status}</span>
            </div>
            <p className="text-xs text-muted mt-1 line-clamp-2">{project.description}</p>
          </div>
          {canWrite && (
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => onEdit(project)} className="btn-ghost p-1.5 rounded-md" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
              {canDelete && (
                <button onClick={() => onDelete(project.id)} className="btn-ghost p-1.5 rounded-md text-red-400 hover:bg-red-500/10" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              )}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted flex-wrap">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(project.deadline)}</span>
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(project.spent)} / {formatCurrency(project.budget)}</span>
          <span>{projectTasks.length} tasks · {assignedCount} assigned</span>
        </div>

        {/* Progress + budget */}
        <div className="mt-3 space-y-2">
          <div>
            <div className="flex justify-between text-[10px] text-muted mb-1">
              <span>Task progress</span><span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted mb-1">
              <span>Budget burn</span>
              <span className={burn > 90 ? 'text-red-400' : burn > 75 ? 'text-amber-400' : ''}>{burn}%</span>
            </div>
            <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-500', burn > 90 ? 'bg-red-500' : burn > 75 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${Math.min(burn, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Required skills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {project.requiredSkills.slice(0, 4).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-slate-700/50 border border-slate-600/30 rounded-full text-[10px] text-slate-400">{s}</span>
          ))}
          {project.requiredSkills.length > 4 && (
            <span className="px-2 py-0.5 text-[10px] text-slate-600">+{project.requiredSkills.length - 4}</span>
          )}
        </div>

        {/* Tasks toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-xs text-muted hover:text-slate-100 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide' : 'Show'} tasks ({projectTasks.length})
        </button>

        {/* Task list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-1.5 border-t border-slate-800 pt-3">
                {projectTasks.map((t) => {
                  const Icon = TASK_STATUS_ICONS[t.status] || CircleDot;
                  const isAssigned = allocations.some((a) => a.taskId === t.id);
                  return (
                    <div key={t.id} className="flex items-center gap-2 group">
                      <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', TASK_STATUS_COLORS[t.status])} />
                      <span className="text-xs text-slate-300 flex-1 truncate">{t.name}</span>
                      <span className="text-[10px] text-muted">{t.estimatedHours}h</span>
                      <span className={cn('badge text-[10px]', getPriorityClasses(t.priority))}>{t.priority.slice(0,1).toUpperCase()}</span>
                      {!isAssigned && <span className="text-[10px] text-amber-400">unassigned</span>}
                    </div>
                  );
                })}
                {canWrite && (
                  <button onClick={() => onAddTask(project)} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors">
                    <Plus className="w-3 h-3" /> Add task
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
