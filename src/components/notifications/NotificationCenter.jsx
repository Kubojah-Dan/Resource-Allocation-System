import { AnimatePresence, motion } from 'framer-motion';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Bell, AlertTriangle, Clock, DollarSign, Info, X, CheckCheck } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';

const NOTIF_ICONS = {
  conflict: AlertTriangle,
  deadline: Clock,
  budget: DollarSign,
  info: Info,
};

const NOTIF_COLORS = {
  conflict: 'text-red-400',
  deadline: 'text-amber-400',
  budget: 'text-orange-400',
  info: 'text-indigo-400',
};

export function NotificationCenter({ onClose }) {
  const { notifications, markRead, markAllRead, dismiss } = useNotificationStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-100">Notifications</span>
          {unread > 0 && (
            <span className="badge bg-red-500/10 text-red-400 border-red-500/20">{unread} new</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="btn-ghost py-1 px-2 text-xs flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-800">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = NOTIF_ICONS[n.type] || Info;
            const colorClass = NOTIF_COLORS[n.type] || 'text-slate-400';
            return (
              <div
                key={n.id}
                className={cn(
                  'flex gap-3 px-4 py-3 group transition-colors',
                  !n.read ? 'bg-slate-800/30' : 'hover:bg-slate-800/20'
                )}
                onClick={() => markRead(n.id)}
              >
                <div className={cn('mt-0.5 flex-shrink-0', colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-medium', !n.read ? 'text-slate-100' : 'text-slate-300')}>
                      {n.title}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 transition-opacity flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
