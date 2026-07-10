import React from 'react';

const StatCard = ({ title, value, icon, badge, description }) => {
  return (
    <div className="glass-card p-6 shadow-soft ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{title}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-800/90 text-2xl">
          {icon}
        </div>
      </div>
      {badge && <span className="mt-5 inline-flex rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300">{badge}</span>}
      {description && <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p>}
    </div>
  );
};

export default StatCard;
