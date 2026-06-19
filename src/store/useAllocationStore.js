import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAllocations } from '../data/mockAllocations';
import { generateId } from '../lib/utils';
import { detectConflicts } from '../lib/conflictDetector';

export const useAllocationStore = create(
  persist(
    (set, get) => ({
      allocations: mockAllocations,
      conflicts: [],
      autoAllocateSuggestions: [],
      isAutoAllocating: false,

      refreshConflicts: (resources, tasks) => {
        const conflicts = detectConflicts(get().allocations, resources, tasks);
        set({ conflicts });
      },

      addAllocation: (allocation) =>
        set((state) => ({
          allocations: [
            ...state.allocations,
            { ...allocation, id: allocation.id || generateId() },
          ],
        })),

      updateAllocation: (id, updates) =>
        set((state) => ({
          allocations: state.allocations.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      deleteAllocation: (id) =>
        set((state) => ({
          allocations: state.allocations.filter((a) => a.id !== id),
        })),

      setAutoAllocateSuggestions: (suggestions) =>
        set({ autoAllocateSuggestions: suggestions }),

      setIsAutoAllocating: (val) => set({ isAutoAllocating: val }),

      acceptSuggestion: (taskId, resourceId, suggestion) => {
        const { startDate, endDate, hoursPerWeek } = suggestion;
        set((state) => ({
          allocations: [
            ...state.allocations,
            {
              id: generateId(),
              resourceId,
              taskId,
              projectId: suggestion.projectId,
              startDate: startDate || new Date().toISOString().split('T')[0],
              endDate: endDate || new Date().toISOString().split('T')[0],
              hoursPerWeek: hoursPerWeek || 20,
            },
          ],
          autoAllocateSuggestions: state.autoAllocateSuggestions.filter(
            (s) => s.task.id !== taskId
          ),
        }));
      },

      rejectSuggestion: (taskId) =>
        set((state) => ({
          autoAllocateSuggestions: state.autoAllocateSuggestions.filter(
            (s) => s.task.id !== taskId
          ),
        })),

      getAllocationsByResource: (resourceId) =>
        get().allocations.filter((a) => a.resourceId === resourceId),

      getAllocationsByTask: (taskId) =>
        get().allocations.filter((a) => a.taskId === taskId),

      getAllocationsByProject: (projectId) =>
        get().allocations.filter((a) => a.projectId === projectId),
    }),
    { name: 'opti-allocations' }
  )
);
