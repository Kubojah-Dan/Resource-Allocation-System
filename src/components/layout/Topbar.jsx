import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { cn, avatarColor } from '../../lib/utils';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/resources': 'Resources',
  '/projects': 'Projects',
  '/allocation-board': 'Allocation Board',
  '/forecasting': 'Forecasting',
  '/budget': 'Budget',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function Topbar({ onSearchOpen }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useSettingsStore();
  const { notifications } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageTitle = PAGE_TITLES[location.pathname] || 'OptiAllocate';

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0 z-30">
      {/* Left: Page title */}
      <div>
        <h1 className="text-base font-semibold text-slate-100">{pageTitle}</h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <button
          onClick={onSearchOpen}
          id="topbar-search-btn"
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-slate-400 text-sm transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-xs">Search...</span>
          <kbd className="hidden md:inline text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">⌘K</kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className="btn-ghost w-9 h-9 p-0 flex items-center justify-center rounded-lg"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            id="notifications-btn"
            className="btn-ghost w-9 h-9 p-0 flex items-center justify-center rounded-lg relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 bg-slate-950/25 backdrop-blur-[3px] z-40 cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(false);
                }}
              />
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            id="user-menu-btn"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold',
              avatarColor(user?.name || 'U')
            )}>
              {user?.avatar?.slice(0, 2) || 'U'}
            </div>
            <span className="hidden md:block text-sm text-slate-300">{user?.name?.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-sm font-medium text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
