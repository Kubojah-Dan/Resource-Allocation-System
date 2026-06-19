import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockResources } from '../data/mockResources';
import { generateId } from '../lib/utils';

export const useResourceStore = create(
  persist(
    (set, get) => ({
      resources: mockResources,
      
      addResource: (resource) =>
        set((state) => ({
          resources: [...state.resources, { ...resource, id: generateId() }],
        })),
      
      updateResource: (id, updates) =>
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      
      deleteResource: (id) =>
        set((state) => ({
          resources: state.resources.filter((r) => r.id !== id),
        })),
      
      getResource: (id) => get().resources.find((r) => r.id === id),
    }),
    { name: 'opti-resources' }
  )
);
