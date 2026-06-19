import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { useAllocationStore } from '../store/useAllocationStore';
import { useAuthStore } from '../store/useAuthStore';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { EmptyState } from '../components/shared/EmptyState';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const STATUSES = ['all', 'active', 'planning', 'on-hold', 'completed'];
const PRIORITIES = ['all', 'critical', 'high', 'medium', 'low'];

export default function Projects() {
  const { projects, tasks, addProject, updateProject, deleteProject, addTask } = useProjectStore();
  const { allocations } = useAllocationStore();
  const { can } = useAuthStore();
  const canWrite = can('write');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const filtered = useMemo(() => projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || p.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  }), [projects, search, statusFilter, priorityFilter]);

  const handleDelete = (id) => {
    if (window.confirm('Delete this project and all its tasks?')) {
      deleteProject(id);
      toast.success('Project deleted');
    }
  };

  const handleSubmit = (data) => {
    if (editTarget) updateProject(editTarget.id, data);
    else addProject(data);
  };

  const handleAddTask = (project) => {
    const name = window.prompt(`Task name for "${project.name}":`);
    if (name) {
      addTask({
        name, projectId: project.id,
        requiredSkills: project.requiredSkills.slice(0, 1),
        estimatedHours: 20, status: 'todo', priority: 'medium', dependencies: [],
      });
      toast.success('Task added');
    }
  };

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    totalTasks: tasks.length,
    unassigned: tasks.filter((t) => !allocations.some((a) => a.taskId === t.id)).length,
  }), [projects, tasks, allocations]);

  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Projects</h1>
          <p className="text-sm text-muted mt-0.5">
            {stats.active} active · {stats.totalTasks} tasks · {stats.unassigned} unassigned
          </p>
        </div>
        {canWrite && (
          <button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="btn-primary flex items-center gap-2" id="add-project-btn">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="input-base w-full pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border capitalize', statusFilter === s ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'text-muted border-slate-700/50 hover:border-slate-600')}>
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PRIORITIES.map((p) => (
            <button key={p} onClick={() => setPriorityFilter(p)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border capitalize', priorityFilter === p ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'text-muted border-slate-700/50 hover:border-slate-600')}>
              {p === 'all' ? 'All Priority' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects found" description="Start by creating your first project" action={canWrite && <button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="btn-primary"><Plus className="w-4 h-4 inline mr-1" />New Project</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                tasks={tasks}
                onEdit={(proj) => { setEditTarget(proj); setFormOpen(true); }}
                onDelete={handleDelete}
                onAddTask={handleAddTask}
                onEditTask={() => {}}
                canWrite={canWrite}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {formOpen && (
          <ProjectForm
            project={editTarget}
            onSubmit={handleSubmit}
            onClose={() => { setFormOpen(false); setEditTarget(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
