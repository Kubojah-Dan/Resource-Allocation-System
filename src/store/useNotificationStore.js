import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: 'n1',
          type: 'conflict',
          title: 'Over-allocation detected',
          message: 'Alex Chen is allocated 48h/week — exceeds 40h capacity',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'n2',
          type: 'conflict',
          title: 'Skill mismatch warning',
          message: 'Morgan Lee assigned to Java task but lacks Java skill',
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'n3',
          type: 'deadline',
          title: 'Deadline approaching',
          message: 'SecureAuth Overhaul deadline in 3 weeks — 2 tasks unassigned',
          read: false,
          createdAt: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: 'n4',
          type: 'budget',
          title: 'Budget alert',
          message: 'DataVault Analytics Dashboard at 82% budget utilization',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            { ...notification, id: generateId(), read: false, createdAt: new Date().toISOString() },
            ...state.notifications,
          ],
        })),

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      dismiss: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'opti-notifications' }
  )
);
