import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-violet-500 text-2xl shadow-soft shadow-cyan-500/20">
            💳
          </span>
          <div>
            <Link to="/dashboard" className="text-xl font-semibold text-slate-100">
              UPI Fraud Guardian
            </Link>
            <p className="text-sm text-slate-400">Secure micro-transactions with AI-powered protection</p>
          </div>
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          <Link to="/dashboard" className="text-sm font-medium text-slate-300 transition hover:text-white">
            Dashboard
          </Link>
          <Link to="/transactions" className="text-sm font-medium text-slate-300 transition hover:text-white">
            Transactions
          </Link>
          <Link to="/insights" className="text-sm font-medium text-slate-300 transition hover:text-white">
            Insights
          </Link>
          <Link to="/fraud-detection" className="text-sm font-medium text-slate-300 transition hover:text-white">
            Fraud Detection
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell count={0} />
          <ThemeToggle />
          <div className="hidden items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-200 shadow-soft sm:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
              <p className="font-semibold text-white">{user.name}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
