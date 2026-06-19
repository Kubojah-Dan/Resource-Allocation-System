import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { SKILL_NAMES } from '../../types/index';
import { useState } from 'react';
import { toast } from 'sonner';

const PROJECT_COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#f97316', '#ef4444', '#22c55e', '#f59e0b', '#ec4899'];

const projectSchema = z.object({
  name: z.string().min(2, 'Project name required'),
  description: z.string().min(5, 'Description required'),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['active', 'planning', 'on-hold', 'completed']),
  deadline: z.string().min(1, 'Deadline required'),
  budget: z.coerce.number().min(1000),
  color: z.string(),
  requiredSkills: z.array(z.string()).min(1, 'Add at least one required skill'),
});

const taskSchema = z.object({
  name: z.string().min(2, 'Task name required'),
  projectId: z.string(),
  requiredSkills: z.array(z.string()).min(1, 'Add at least one skill'),
  estimatedHours: z.coerce.number().min(1),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['todo', 'in-progress', 'done']),
  dependencies: z.array(z.string()),
});

export function ProjectForm({ project, onSubmit, onClose }) {
  const isEdit = !!project;
  const [skillSearch, setSkillSearch] = useState('');
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: project || {
      name: '', description: '', priority: 'high', status: 'planning',
      deadline: '', budget: 50000, color: '#6366f1', requiredSkills: [],
    },
  });

  const requiredSkills = watch('requiredSkills') || [];
  const selectedColor = watch('color');

  const addSkill = (s) => {
    if (!requiredSkills.includes(s)) setValue('requiredSkills', [...requiredSkills, s]);
    setSkillSearch('');
  };
  const removeSkill = (s) => setValue('requiredSkills', requiredSkills.filter((x) => x !== s));

  const filteredSkills = SKILL_NAMES.filter(
    (s) => s.toLowerCase().includes(skillSearch.toLowerCase()) && !requiredSkills.includes(s)
  );

  const submit = (data) => { onSubmit(data); toast.success(isEdit ? 'Project updated' : 'Project created'); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">{isEdit ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit(submit)} className="p-6 space-y-4">
          <div>
            <label className="label block mb-1.5">Project Name</label>
            <input {...register('name')} className="input-base w-full" placeholder="e.g. Platform Rewrite v3" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label block mb-1.5">Description</label>
            <textarea {...register('description')} rows={2} className="input-base w-full resize-none" placeholder="Brief project description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Priority</label>
              <select {...register('priority')} className="input-base w-full">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Status</label>
              <select {...register('status')} className="input-base w-full">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Deadline</label>
              <input {...register('deadline')} type="date" className="input-base w-full" />
            </div>
            <div>
              <label className="label block mb-1.5">Budget ($)</label>
              <input {...register('budget')} type="number" className="input-base w-full" />
            </div>
          </div>
          {/* Color */}
          <div>
            <label className="label block mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  type="button" key={c} onClick={() => setValue('color', c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          {/* Required Skills */}
          <div>
            <label className="label block mb-1.5">Required Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {requiredSkills.map((s) => (
                <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            {errors.requiredSkills && <p className="text-xs text-red-400 mb-1">{errors.requiredSkills.message}</p>}
            <div className="relative">
              <input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} className="input-base w-full" placeholder="Search skills..." />
              {skillSearch && filteredSkills.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg max-h-36 overflow-y-auto z-10">
                  {filteredSkills.slice(0, 8).map((s) => (
                    <button type="button" key={s} onClick={() => addSkill(s)} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{isEdit ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
