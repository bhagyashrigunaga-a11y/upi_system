import React from 'react';
import { motion } from 'framer-motion';

const NotificationBell = ({ count = 0 }) => {
  return (
    <button
      type="button"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-600/70 bg-slate-900/80 text-slate-200 shadow-soft transition hover:bg-slate-800"
      aria-label="View notifications"
    >
      <motion.span
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
        className="text-xl"
      >
        🔔
      </motion.span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[0.7rem] font-semibold text-white shadow-soft">
          {count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
