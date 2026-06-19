import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, LayoutDashboard, Users, FolderKanban,
  CalendarDays, TrendingUp, BarChart3, Settings,
  DollarSign, ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const COMMANDS = [
  { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, to: '/', group: 'Navigation' },
  { id: 'nav-resources', label: 'Go to Resources', icon: Users, to: '/resources', group: 'Navigation' },
  { id: 'nav-projects', label: 'Go to Projects', icon: FolderKanban, to: '/projects', group: 'Navigation' },
  { id: 'nav-board', label: 'Go to Allocation Board', icon: CalendarDays, to: '/allocation-board', group: 'Navigation' },
  { id: 'nav-forecast', label: 'Go to Forecasting', icon: TrendingUp, to: '/forecasting', group: 'Navigation' },
  { id: 'nav-budget', label: 'Go to Budget', icon: DollarSign, to: '/budget', group: 'Navigation' },
  { id: 'nav-reports', label: 'Go to Reports', icon: BarChart3, to: '/reports', group: 'Navigation' },
  { id: 'nav-settings', label: 'Go to Settings', icon: Settings, to: '/settings', group: 'Navigation' },
];

export function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = query.trim()
    ? COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const execute = (cmd) => {
    if (cmd.to) navigate(cmd.to);
    onClose();
  };

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selected]) execute(filtered[selected]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Group commands
  const groups = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
                <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                  onKeyDown={handleKey}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm outline-none"
                />
                <kbd className="text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto p-2">
                {Object.keys(groups).length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">No results found</p>
                ) : (
                  Object.entries(groups).map(([group, cmds]) => (
                    <div key={group} className="mb-2">
                      <p className="label px-2 py-1.5">{group}</p>
                      {cmds.map((cmd) => {
                        const globalIdx = filtered.indexOf(cmd);
                        const Icon = cmd.icon;
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => execute(cmd)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                              globalIdx === selected
                                ? 'bg-indigo-600/20 text-indigo-300'
                                : 'text-slate-300 hover:bg-slate-800'
                            )}
                            onMouseEnter={() => setSelected(globalIdx)}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0 opacity-60" />
                            {cmd.label}
                            <ArrowRight className="w-3 h-3 ml-auto opacity-40" />
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-600">
                <span><kbd className="bg-slate-800 px-1 rounded">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-slate-800 px-1 rounded">↵</kbd> Select</span>
                <span><kbd className="bg-slate-800 px-1 rounded">esc</kbd> Close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
