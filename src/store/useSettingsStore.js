import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_WEIGHTS } from '../lib/allocationEngine';

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      engineWeights: { ...DEFAULT_WEIGHTS },
      sidebarCollapsed: false,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setEngineWeight: (key, value) =>
        set((state) => ({
          engineWeights: { ...state.engineWeights, [key]: parseFloat(value) },
        })),

      resetEngineWeights: () => set({ engineWeights: { ...DEFAULT_WEIGHTS } }),

      setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'opti-settings' }
  )
);
