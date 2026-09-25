import React from 'react';
import { Vote, ShieldCheck, Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/60 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Vote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Campus Vote</p>
              <p className="text-xs text-slate-500">Live audience voting & interactive polling</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-Time Updates</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Duplicate Vote Prevention</span>
            </div>
            <span>·</span>
            <span>₹0 Budget Open Stack</span>
          </div>

          <p className="text-xs text-slate-400">
            Designed for colleges, seminars & hackathons.
          </p>
        </div>
      </div>
    </footer>
  );
};
