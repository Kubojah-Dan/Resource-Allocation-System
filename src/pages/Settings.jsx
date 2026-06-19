import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { DEFAULT_WEIGHTS } from '../lib/allocationEngine';
import { Settings as SettingsIcon, Sliders, Sun, Moon, User, RotateCcw, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const WEIGHT_LABELS = {
  skill: { label: 'Skill Match Weight', description: 'How much skill overlap matters when scoring candidates', color: 'indigo' },
  availability: { label: 'Availability Weight', description: 'How much free capacity matters in scoring', color: 'emerald' },
  cost: { label: 'Cost Efficiency Weight', description: 'Preference for lower-cost resources (within skill threshold)', color: 'amber' },
  workload: { label: 'Workload Balance Weight', description: 'Penalizes already-busy resources to spread work evenly', color: 'violet' },
};

export default function Settings() {
  const { theme, toggleTheme, engineWeights, setEngineWeight, resetEngineWeights } = useSettingsStore();
  const { user, logout } = useAuthStore();

  const totalWeight = Object.values(engineWeights).reduce((s, v) => s + v, 0);
  const isNormalized = Math.abs(totalWeight - 1) < 0.01;

  const handleWeightChange = (key, val) => {
    setEngineWeight(key, val);
  };

  const handleReset = () => {
    resetEngineWeights();
    toast.success('Engine weights reset to defaults');
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-400" />
          Settings
        </h1>
        <p className="text-sm text-muted mt-0.5">Configure application preferences and allocation engine parameters</p>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-200 font-medium">Theme</p>
            <p className="text-xs text-muted mt-0.5">Switch between dark and light mode</p>
          </div>
          <button
            onClick={toggleTheme}
            id="settings-theme-btn"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.avatar || 'U'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">{user?.name}</p>
            <p className="text-xs text-muted">{user?.email}</p>
            <span className={cn('badge mt-1', {
              admin: 'bg-red-500/10 text-red-400 border-red-500/20',
              manager: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
              viewer: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
            }[user?.role] || 'bg-slate-700/50 text-slate-400 border-slate-600/30')}>
              {user?.role}
            </span>
          </div>
          <button onClick={logout} className="btn-secondary ml-auto text-sm">Sign Out</button>
        </div>
      </div>

      {/* Allocation Engine Weights */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="section-title flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Allocation Engine Weights
          </h2>
          <button onClick={handleReset} className="btn-ghost text-xs flex items-center gap-1.5">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <p className="text-xs text-muted mb-5">
          Adjust how the Auto-Allocate engine scores candidates. Weights don't need to sum to 1 — they're normalized internally.
        </p>

        <div className="space-y-6">
          {Object.entries(WEIGHT_LABELS).map(([key, { label, description, color }]) => {
            const val = engineWeights[key] ?? DEFAULT_WEIGHTS[key];
            const pct = Math.round(val * 100);
            const barColors = {
              indigo: 'bg-indigo-500',
              emerald: 'bg-emerald-500',
              amber: 'bg-amber-500',
              violet: 'bg-violet-500',
            };
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{label}</p>
                    <p className="text-xs text-muted mt-0.5">{description}</p>
                  </div>
                  <span className={cn('text-lg font-bold', {
                    indigo: 'text-indigo-400',
                    emerald: 'text-emerald-400',
                    amber: 'text-amber-400',
                    violet: 'text-violet-400',
                  }[color])}>
                    {pct}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={val}
                    onChange={(e) => handleWeightChange(key, e.target.value)}
                    className="flex-1 accent-indigo-500 h-2 cursor-pointer"
                  />
                </div>
                {/* Visual bar */}
                <div className="h-1 bg-slate-700/50 rounded-full mt-2 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-200', barColors[color])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Weight normalization info */}
        <div className={cn('mt-5 flex items-start gap-2 p-3 rounded-lg text-xs', isNormalized ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-amber-500/5 border border-amber-500/20')}>
          <Info className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', isNormalized ? 'text-emerald-400' : 'text-amber-400')} />
          <p className={isNormalized ? 'text-emerald-300' : 'text-amber-300'}>
            {isNormalized
              ? `Weights sum to 100% — engine is perfectly calibrated.`
              : `Weights sum to ${Math.round(totalWeight * 100)}% — they'll be normalized to 100% when the engine runs.`
            }
          </p>
        </div>
      </div>

      {/* Data */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Data & Storage</h2>
        <p className="text-xs text-muted mb-4">All data is stored in your browser's localStorage. No backend required.</p>
        <button
          onClick={() => {
            if (window.confirm('Clear all local data and reload? This cannot be undone.')) {
              ['opti-resources', 'opti-projects', 'opti-allocations', 'opti-auth', 'opti-notifications', 'opti-settings'].forEach((k) => localStorage.removeItem(k));
              window.location.reload();
            }
          }}
          className="px-4 py-2 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}
