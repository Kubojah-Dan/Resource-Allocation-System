import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockProjects, mockTasks } from '../data/mockProjects';
import { generateId } from '../lib/utils';

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: mockProjects,
      tasks: mockTasks,

      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id: generateId(),
              spent: 0,
              status: project.status || 'planning',
            },
          ],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
        })),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: generateId() }],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      getProject: (id) => get().projects.find((p) => p.id === id),
      getTasksByProject: (projectId) =>
        get().tasks.filter((t) => t.projectId === projectId),
      getTask: (id) => get().tasks.find((t) => t.id === id),
    }),
    { name: 'opti-projects' }
  )
);
