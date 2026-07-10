import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const storageKey = 'upi-theme-mode';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(storageKey);
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-600/70 bg-slate-900/80 text-slate-200 shadow-soft transition hover:bg-slate-800"
      aria-label="Toggle dark mode"
    >
      <motion.span
        key={theme}
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 360, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </motion.span>
    </button>
  );
};

export default ThemeToggle;
