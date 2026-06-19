import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Grid, Table } from 'lucide-react';
import { useResourceStore } from '../store/useResourceStore';
import { useAllocationStore } from '../store/useAllocationStore';
import { useAuthStore } from '../store/useAuthStore';
import { ResourceCard } from '../components/resources/ResourceCard';
import { SkillMatrix } from '../components/resources/SkillMatrix';
import { ResourceForm } from '../components/resources/ResourceForm';
import { EmptyState } from '../components/shared/EmptyState';
import { ROLE_LABELS } from '../types/index';
import { cn } from '../lib/utils';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = ['all', 'engineer', 'designer', 'pm', 'qa', 'devops'];
const AVAILABILITY = ['all', 'available', 'partially-available', 'unavailable'];

export default function Resources() {
  const { resources, addResource, updateResource, deleteResource } = useResourceStore();
  const { allocations } = useAllocationStore();
  const { can } = useAuthStore();
  const canWrite = can('write');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [availFilter, setAvailFilter] = useState('all');
  const [view, setView] = useState('grid'); // 'grid' | 'matrix'
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.role.toLowerCase().includes(search.toLowerCase()) ||
        r.skills.some((s) => s.name.toLowerCase().includes(search.toLowerCase()));
      const matchRole = roleFilter === 'all' || r.role === roleFilter;
      const matchAvail = availFilter === 'all' || r.availability === availFilter;
      return matchSearch && matchRole && matchAvail;
    });
  }, [resources, search, roleFilter, availFilter]);

  const handleEdit = (r) => { setEditTarget(r); setFormOpen(true); };
  const handleDelete = (id) => {
    if (window.confirm('Delete this resource?')) {
      deleteResource(id);
      toast.success('Resource deleted');
    }
  };
  const handleFormSubmit = (data) => {
    if (editTarget) {
      updateResource(editTarget.id, data);
    } else {
      addResource({ ...data, avatar: data.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() });
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Resources</h1>
          <p className="text-sm text-muted mt-0.5">{resources.length} people across {new Set(resources.map((r) => r.department)).size} departments</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700/50">
            <button
              onClick={() => setView('grid')}
              className={cn('p-1.5 rounded-md transition-colors', view === 'grid' ? 'bg-slate-700 text-slate-100' : 'text-muted hover:text-slate-300')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('matrix')}
              className={cn('p-1.5 rounded-md transition-colors', view === 'matrix' ? 'bg-slate-700 text-slate-100' : 'text-muted hover:text-slate-300')}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
          {canWrite && (
            <button
              onClick={() => { setEditTarget(null); setFormOpen(true); }}
              className="btn-primary flex items-center gap-2"
              id="add-resource-btn"
            >
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, role, skill..."
            className="input-base w-full pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                roleFilter === r
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                  : 'text-muted border-slate-700/50 hover:border-slate-600 hover:text-slate-300'
              )}
            >
              {r === 'all' ? 'All Roles' : ROLE_LABELS[r] || r}
            </button>
          ))}
        </div>
        <select
          value={availFilter}
          onChange={(e) => setAvailFilter(e.target.value)}
          className="input-base py-1.5 text-xs"
        >
          <option value="all">All Availability</option>
          <option value="available">Available</option>
          <option value="partially-available">Partially Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No resources found"
          description="Try adjusting your filters or add a new resource"
          action={canWrite && (
            <button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="btn-primary">
              <Plus className="w-4 h-4 inline mr-1" />Add Resource
            </button>
          )}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                allocations={allocations}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canWrite={canWrite}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card p-5">
          <h2 className="section-title mb-4">Skill Matrix</h2>
          <SkillMatrix resources={filtered} />
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {formOpen && (
          <ResourceForm
            resource={editTarget}
            onSubmit={handleFormSubmit}
            onClose={() => { setFormOpen(false); setEditTarget(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
