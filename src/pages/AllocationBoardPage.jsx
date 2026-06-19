import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext, DragOverlay, closestCenter, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import { format, addWeeks, startOfWeek } from 'date-fns';
import { useResourceStore } from '../store/useResourceStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAllocationStore } from '../store/useAllocationStore';
import { useAuthStore } from '../store/useAuthStore';
import { ResourceRow } from '../components/allocation-board/ResourceRow';
import { TaskBlock } from '../components/allocation-board/TaskBlock';
import { AutoAllocateButton } from '../components/allocation-engine/AutoAllocateButton';
import { SuggestionCard } from '../components/allocation-engine/SuggestionCard';
import { ConflictBanner } from '../components/allocation-engine/ConflictBanner';
import { detectConflicts } from '../lib/conflictDetector';
import { cn, getWeekDates, avatarColor, formatCurrency, getPriorityClasses, getStatusClasses } from '../lib/utils';
import { X, AlertTriangle, CalendarDays, Zap } from 'lucide-react';
import { toast } from 'sonner';

const WEEK_COUNT = 8;

export default function AllocationBoardPage() {
  const { resources } = useResourceStore();
  const { projects, tasks } = useProjectStore();
  const { allocations, updateAllocation, deleteAllocation, autoAllocateSuggestions } = useAllocationStore();
  const { can } = useAuthStore();
  const canWrite = can('write');

  const [activeId, setActiveId] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState(null); // { allocation, task, project }
  const [showSuggestions, setShowSuggestions] = useState(true);

  const weekDates = useMemo(() => getWeekDates(WEEK_COUNT), []);

  const taskMap = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks]);
  const projectMap = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);

  const conflicts = useMemo(
    () => detectConflicts(allocations, resources, tasks),
    [allocations, resources, tasks]
  );

  const unassignedTasks = useMemo(
    () => tasks.filter((t) => !allocations.some((a) => a.taskId === t.id) && t.status !== 'done'),
    [tasks, allocations]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || !canWrite) return;
    const { resourceId, weekStart } = over.data?.current || {};
    if (!resourceId) return;
    const allocation = allocations.find((a) => a.id === active.id);
    if (!allocation || allocation.resourceId === resourceId) return;
    updateAllocation(allocation.id, { resourceId });
    toast.success('Task reassigned successfully');
  };

  const activeAllocation = activeId ? allocations.find((a) => a.id === activeId) : null;

  return (
    <div className="flex h-full min-h-0">
      {/* Main board */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Board header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
              Allocation Board
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {conflicts.length > 0 && <span className="text-red-400">{conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} · </span>}
              {unassignedTasks.length} unassigned tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canWrite && autoAllocateSuggestions.length > 0 && (
              <button
                onClick={() => setShowSuggestions((v) => !v)}
                className={cn('badge border', showSuggestions ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-700/50 text-muted border-slate-600/30')}
              >
                <Zap className="w-3 h-3" />
                {autoAllocateSuggestions.length} suggestion{autoAllocateSuggestions.length > 1 ? 's' : ''}
              </button>
            )}
            {canWrite && <AutoAllocateButton unassignedTasks={unassignedTasks} />}
          </div>
        </div>

        {/* Conflict banners */}
        {conflicts.length > 0 && (
          <div className="flex-shrink-0 px-6 py-3 border-b border-slate-800">
            <ConflictBanner conflicts={conflicts.slice(0, 3)} />
          </div>
        )}

        {/* Timeline board */}
        <div className="flex-1 overflow-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Week header row */}
            <div className="sticky top-0 z-10 flex bg-slate-900 border-b border-slate-800">
              <div className="w-44 flex-shrink-0 px-3 py-2 border-r border-slate-800">
                <span className="text-[10px] text-muted uppercase tracking-widest">Resource</span>
              </div>
              {weekDates.map((wd, i) => (
                <div key={i} className="flex-1 min-w-[120px] px-2 py-2 border-r border-slate-800/40 text-center">
                  <div className="text-[10px] font-semibold text-slate-400">
                    {i === 0 ? 'This week' : `Week ${i + 1}`}
                  </div>
                  <div className="text-[9px] text-muted">{format(wd, 'MMM d')}</div>
                </div>
              ))}
            </div>

            {/* Resource rows */}
            {resources.map((resource) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                weekDates={weekDates}
                allocations={allocations}
                taskMap={taskMap}
                projectMap={projectMap}
                conflicts={conflicts.filter((c) => c.resourceId === resource.id)}
                onTaskClick={(alloc, task, project) => setSelectedPanel({ allocation: alloc, task, project })}
              />
            ))}

            <DragOverlay>
              {activeAllocation && (
                <div className="opacity-80 scale-105 shadow-2xl">
                  <TaskBlock
                    allocation={activeAllocation}
                    task={taskMap[activeAllocation.taskId]}
                    project={projectMap[activeAllocation.projectId]}
                    onClick={() => {}}
                    isDragging
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Right panel: suggestions OR task detail */}
      <AnimatePresence>
        {(selectedPanel || autoAllocateSuggestions.length > 0) && showSuggestions && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0 border-l border-slate-800 bg-slate-900 overflow-hidden"
          >
            <div className="w-80 h-full overflow-y-auto p-4 space-y-4">
              {/* Task detail panel */}
              {selectedPanel && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-100">Task Detail</h3>
                    <button onClick={() => setSelectedPanel(null)} className="btn-ghost p-1 rounded"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="card p-4 space-y-3">
                    <div className="h-1 rounded-full mb-3" style={{ background: selectedPanel.project?.color || '#6366f1' }} />
                    <div>
                      <p className="text-xs text-muted">Task</p>
                      <p className="text-sm font-semibold text-slate-100 mt-0.5">{selectedPanel.task?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Project</p>
                      <p className="text-sm text-slate-300">{selectedPanel.project?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={cn('badge', getPriorityClasses(selectedPanel.task?.priority))}>{selectedPanel.task?.priority}</span>
                      <span className={cn('badge', getStatusClasses(selectedPanel.task?.status))}>{selectedPanel.task?.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted">Estimated</p>
                        <p className="text-slate-200 font-medium">{selectedPanel.task?.estimatedHours}h</p>
                      </div>
                      <div>
                        <p className="text-muted">Weekly hrs</p>
                        <p className="text-slate-200 font-medium">{selectedPanel.allocation?.hoursPerWeek}h/wk</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1.5">Required Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPanel.task?.requiredSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-700/50 border border-slate-600/30 rounded-full text-[10px] text-slate-400">{s}</span>
                        ))}
                      </div>
                    </div>
                    {canWrite && (
                      <button
                        onClick={() => {
                          if (window.confirm('Remove this allocation?')) {
                            deleteAllocation(selectedPanel.allocation.id);
                            setSelectedPanel(null);
                            toast.success('Allocation removed');
                          }
                        }}
                        className="w-full text-xs text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition-colors border border-red-500/20 mt-2"
                      >
                        Remove Allocation
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {autoAllocateSuggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-slate-100">Smart Suggestions</h3>
                    <span className="badge bg-indigo-500/10 text-indigo-400 border-indigo-500/20 ml-auto">{autoAllocateSuggestions.length}</span>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {autoAllocateSuggestions.map((s) => (
                        <SuggestionCard key={s.task.id} suggestion={s} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
