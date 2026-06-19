import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MOCK_USERS = [
  { id: 'u1', name: 'Alex Admin', email: 'admin@optiallocate.io', role: 'admin', avatar: 'AA' },
  { id: 'u2', name: 'Maya Manager', email: 'manager@optiallocate.io', role: 'manager', avatar: 'MM' },
  { id: 'u3', name: 'Victor Viewer', email: 'viewer@optiallocate.io', role: 'viewer', avatar: 'VV' },
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (role = 'admin') => {
        const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
        set({ user, isAuthenticated: true });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      can: (action) => {
        const { user } = get();
        if (!user) return false;
        const permissions = {
          admin: ['read', 'write', 'delete', 'manage'],
          manager: ['read', 'write'],
          viewer: ['read'],
        };
        return (permissions[user.role] || []).includes(action);
      },
    }),
    { name: 'opti-auth' }
  )
);
