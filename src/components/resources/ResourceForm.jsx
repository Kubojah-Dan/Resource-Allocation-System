import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { SKILL_NAMES, ROLE_LABELS } from '../../types/index';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['engineer', 'designer', 'pm', 'qa', 'devops']),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  hourlyCost: z.coerce.number().min(1).max(1000),
  weeklyCapacity: z.coerce.number().min(1).max(80),
  availability: z.enum(['available', 'partially-available', 'unavailable']),
  skills: z.array(z.object({
    name: z.string().min(1),
    proficiency: z.coerce.number().min(1).max(5),
  })).min(1, 'Add at least one skill'),
});

export function ResourceForm({ resource, onSubmit, onClose }) {
  const isEdit = !!resource;
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: resource || {
      name: '', role: 'engineer', department: 'Engineering', location: '',
      hourlyCost: 80, weeklyCapacity: 40, availability: 'available', skills: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'skills' });
  const [skillSearch, setSkillSearch] = useState('');

  const filteredSkills = SKILL_NAMES.filter(
    (s) => s.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !fields.some((f) => f.name === s)
  );

  const addSkill = (name) => {
    append({ name, proficiency: 3 });
    setSkillSearch('');
  };

  const submit = (data) => {
    onSubmit(data);
    toast.success(isEdit ? 'Resource updated' : 'Resource created');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">{isEdit ? 'Edit Resource' : 'Add Resource'}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-6 space-y-5">
          {/* Name & Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Name</label>
              <input {...register('name')} className="input-base w-full" placeholder="Full name" />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label block mb-1.5">Role</label>
              <select {...register('role')} className="input-base w-full">
                {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Department</label>
              <input {...register('department')} className="input-base w-full" placeholder="Engineering" />
            </div>
            <div>
              <label className="label block mb-1.5">Location</label>
              <input {...register('location')} className="input-base w-full" placeholder="City, Country" />
            </div>
          </div>

          {/* Cost & Capacity */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label block mb-1.5">Hourly Cost ($)</label>
              <input {...register('hourlyCost')} type="number" className="input-base w-full" />
              {errors.hourlyCost && <p className="text-xs text-red-400 mt-1">{errors.hourlyCost.message}</p>}
            </div>
            <div>
              <label className="label block mb-1.5">Weekly Hrs</label>
              <input {...register('weeklyCapacity')} type="number" className="input-base w-full" />
            </div>
            <div>
              <label className="label block mb-1.5">Availability</label>
              <select {...register('availability')} className="input-base w-full">
                <option value="available">Available</option>
                <option value="partially-available">Partial</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="label block mb-1.5">Skills</label>
            {/* Skill tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <span className="text-xs text-indigo-300">{field.name}</span>
                  <select
                    {...register(`skills.${i}.proficiency`)}
                    className="bg-transparent text-xs text-indigo-400 outline-none"
                  >
                    {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button type="button" onClick={() => remove(i)} className="text-indigo-500 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {errors.skills && <p className="text-xs text-red-400 mb-2">{errors.skills.message}</p>}
            {/* Skill search */}
            <div className="relative">
              <input
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="input-base w-full"
                placeholder="Search and add skills..."
              />
              {skillSearch && filteredSkills.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg max-h-36 overflow-y-auto z-10">
                  {filteredSkills.slice(0, 8).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => addSkill(s)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{isEdit ? 'Save Changes' : 'Add Resource'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
