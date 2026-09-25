import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Vote, Radio, Sparkles, Check, Database, Copy } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  onOpenSupabaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSupabaseModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quickCode, setQuickCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const isSupabaseActive = isSupabaseConfigured();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCode.trim()) {
      navigate(`/poll/${quickCode.trim().toUpperCase()}`);
      setQuickCode('');
      setShowCodeInput(false);
    }
  };

  const isPresentMode = location.pathname.includes('/present');
  if (isPresentMode) {
    return null; // Presentation mode has its own dedicated minimalist header
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F4F6FB]/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] group-hover:scale-105 transition-transform duration-200">
            <Vote className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Campus Vote
            </span>
          </div>
        </Link>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            to="/"
            className={`hover:text-indigo-600 transition-colors ${
              location.pathname === '/' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Overview
          </Link>
          <Link
            to="/host"
            className={`hover:text-indigo-600 transition-colors ${
              location.pathname.startsWith('/host') ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Host Dashboard
          </Link>
          <Link
            to="/create-poll"
            className={`hover:text-indigo-600 transition-colors ${
              location.pathname === '/create-poll' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Create Poll
          </Link>
          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-mono text-[11px]">
                {isSupabaseActive ? 'Supabase Connected' : 'Local Realtime'}
              </span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary actions & Quick Code Join */}
        <div className="flex items-center gap-3">
          {showCodeInput ? (
            <form onSubmit={handleJoin} className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
              <input
                type="text"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                placeholder="6-Digit Code"
                maxLength={8}
                autoFocus
                className="w-28 px-2.5 py-1.5 text-xs font-mono font-semibold tracking-wider uppercase rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setShowCodeInput(false)}
                className="p-1.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowCodeInput(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl clay-pill transition-all cursor-pointer whitespace-nowrap"
            >
              Join with Code
            </button>
          )}

          <Link
            to="/host"
            className="px-4 py-2 text-xs font-semibold text-white clay-btn-primary rounded-xl whitespace-nowrap"
          >
            Host a Poll
          </Link>
        </div>
      </div>
    </header>
  );
};
