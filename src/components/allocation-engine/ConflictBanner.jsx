import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ConflictBanner({ conflicts, onDismiss }) {
  if (!conflicts || conflicts.length === 0) return null;

  const errors = conflicts.filter((c) => c.severity === 'error');
  const warnings = conflicts.filter((c) => c.severity === 'warning');

  return (
    <div className="space-y-2">
      {conflicts.map((c) => (
        <div
          key={c.id}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-lg border-l-2 text-sm',
            c.severity === 'error'
              ? 'bg-red-500/5 border-l-red-500 border border-red-500/20'
              : 'bg-amber-500/5 border-l-amber-500 border border-amber-500/20'
          )}
        >
          <AlertTriangle className={cn('w-4 h-4 flex-shrink-0 mt-0.5', c.severity === 'error' ? 'text-red-400' : 'text-amber-400')} />
          <div className="flex-1 min-w-0">
            <span className={cn('text-xs font-semibold uppercase tracking-wide', c.severity === 'error' ? 'text-red-400' : 'text-amber-400')}>
              {c.type.replace('-', ' ')}
            </span>
            <p className="text-xs text-slate-300 mt-0.5">{c.message}</p>
          </div>
          {onDismiss && (
            <button onClick={() => onDismiss(c.id)} className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
