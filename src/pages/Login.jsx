import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, Eye, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

const ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Full access — create, edit, delete, manage all resources',
    icon: Shield,
    color: 'border-indigo-500/50 bg-indigo-500/10',
    iconColor: 'text-indigo-400',
  },
  {
    id: 'manager',
    label: 'Manager',
    description: 'Read & write — manage projects, resources, and allocations',
    icon: Zap,
    color: 'border-violet-500/50 bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
  {
    id: 'viewer',
    label: 'Viewer',
    description: 'Read only — view dashboards, reports, and allocation boards',
    icon: Eye,
    color: 'border-slate-500/50 bg-slate-800/50',
    iconColor: 'text-slate-400',
  },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    login(selectedRole);
    toast.success(`Welcome back! Signed in as ${selectedRole}`);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 to-slate-950 border-r border-slate-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center glow-indigo">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">OptiAllocate</span>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight">
              Intelligent resource<br />
              allocation, <span className="text-indigo-400">simplified.</span>
            </h2>
            <p className="text-slate-400 mt-4 text-base leading-relaxed max-w-sm">
              Allocate people, equipment, and budget across projects — with real-time conflict detection and smart optimization.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { value: '15', label: 'Resources' },
              { value: '6', label: 'Projects' },
              { value: '3', label: 'Conflicts' },
            ].map((s) => (
              <div key={s.label} className="card px-4 py-3 text-center">
                <div className="text-2xl font-bold text-indigo-400">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="relative text-xs text-slate-600">© 2026 OptiAllocate · Smart Resource Allocation System</p>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-white">OptiAllocate</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
            <p className="text-slate-400 text-sm">Select your role to explore the demo</p>
          </div>

          {/* Role picker */}
          <div className="space-y-3">
            <p className="label">Access level</p>
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left ${
                    selectedRole === role.id
                      ? role.color + ' border-opacity-100'
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 ${role.iconColor}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-100">{role.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                  </div>
                  {selectedRole === role.id && (
                    <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleLogin}
            id="login-btn"
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base font-semibold"
          >
            Enter OptiAllocate
            <ChevronRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-center text-slate-600">
            This is a demo — no real credentials required
          </p>
        </motion.div>
      </div>
    </div>
  );
}
