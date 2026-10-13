import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Default admin credentials: admin / hadi88
      if ((username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'hadi88') && 
          (password === 'hadi88' || password === 'admin88' || password === 'admin123')) {
        onLoginSuccess();
      } else {
        setError('Invalid admin credentials. Please use admin / hadi88');
      }
      setLoading(false);
    }, 400);
  };

  const handleQuickDemo = () => {
    setUsername('admin');
    setPassword('hadi88');
    setError('');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-amber-500/25 shadow-2xl space-y-5 bg-[#140e0b]/95">
        
        {/* Back Link */}
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Store</span>
          </button>

          <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            /admin/manage/
          </span>
        </div>

        {/* Lock Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black mx-auto shadow-lg shadow-amber-500/25">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Admin Authentication
          </h1>
          <p className="text-xs text-stone-400">
            Secure administrative control portal for Hadi88 Apps.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-stone-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Management'}</span>
          </button>
        </form>

        {/* Quick Demo Credentials Helper */}
        <div className="pt-2 border-t border-amber-500/10 text-center space-y-1.5">
          <div className="text-[11px] text-stone-400">
            Demo Credentials: <span className="font-mono text-amber-300 font-bold">admin</span> / <span className="font-mono text-amber-300 font-bold">hadi88</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-[11px] text-amber-400 hover:underline font-semibold"
          >
            Auto-fill credentials
          </button>
        </div>

      </div>
    </div>
  );
};
