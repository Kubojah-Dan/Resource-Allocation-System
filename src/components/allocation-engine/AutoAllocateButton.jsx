import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, X, Loader2 } from 'lucide-react';
import { useAllocationStore } from '../../store/useAllocationStore';
import { useResourceStore } from '../../store/useResourceStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { runAutoAllocate } from '../../lib/allocationEngine';
import { toast } from 'sonner';
import { format, addWeeks, startOfWeek } from 'date-fns';
import { cn } from '../../lib/utils';

export function AutoAllocateButton({ unassignedTasks }) {
  const { allocations, setAutoAllocateSuggestions, setIsAutoAllocating, isAutoAllocating } = useAllocationStore();
  const { resources } = useResourceStore();
  const { engineWeights } = useSettingsStore();

  const handleAutoAllocate = async () => {
    if (unassignedTasks.length === 0) {
      toast.info('No unassigned tasks to allocate');
      return;
    }
    setIsAutoAllocating(true);
    // Simulate async processing
    await new Promise((r) => setTimeout(r, 800));
    const suggestions = runAutoAllocate(unassignedTasks, resources, allocations, engineWeights);
    setAutoAllocateSuggestions(suggestions);
    setIsAutoAllocating(false);
    toast.success(`Generated ${suggestions.length} allocation suggestions`);
  };

  return (
    <button
      onClick={handleAutoAllocate}
      disabled={isAutoAllocating}
      id="auto-allocate-btn"
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
        'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500',
        'text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30',
        'disabled:opacity-60 disabled:cursor-not-allowed'
      )}
    >
      {isAutoAllocating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Zap className="w-4 h-4" />
      )}
      {isAutoAllocating ? 'Analyzing...' : 'Auto-Allocate'}
      {unassignedTasks.length > 0 && (
        <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
          {unassignedTasks.length}
        </span>
      )}
    </button>
  );
}
