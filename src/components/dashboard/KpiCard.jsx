import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

export function KpiCard({ label, value, subtitle, icon: Icon, trend, color = 'indigo', suffix = '', prefix = '' }) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const animated = useCountUp(numericValue);
  const displayValue = typeof value === 'number'
    ? `${prefix}${animated}${suffix}`
    : value;

  const colorClasses = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
    violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20',
    sky: 'from-sky-500/20 to-sky-600/5 border-sky-500/20',
  };

  const iconColorClasses = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    violet: 'bg-violet-500/20 text-violet-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
    sky: 'bg-sky-500/20 text-sky-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        'relative rounded-xl border p-5 bg-gradient-to-br overflow-hidden',
        colorClasses[color] || colorClasses.indigo
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-slate-900/80 rounded-xl" style={{ zIndex: 0 }} />
      <div className={cn('absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-5 blur-2xl', `bg-${color}-500`)} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</p>
          {Icon && (
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconColorClasses[color] || iconColorClasses.indigo)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-slate-100 tracking-tight animate-count-up">
              {displayValue}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend > 0 ? 'bg-emerald-500/10 text-emerald-400'
              : trend < 0 ? 'bg-red-500/10 text-red-400'
              : 'bg-slate-700/50 text-slate-500'
            )}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
