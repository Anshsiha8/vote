import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Vote,
  QrCode,
  Smartphone,
  BarChart3,
  ArrowRight,
  Sparkles,
  Users,
  Presentation,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [joinCode, setJoinCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const navigate = useNavigate();

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setCodeError('Please enter a valid 6-character poll code');
      return;
    }
    navigate(`/poll/${joinCode.trim().toUpperCase()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Soft background accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-200/40 via-violet-100/30 to-blue-200/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Brand Wordmark & Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-100 shadow-[0_4px_12px_rgba(79,70,229,0.08)] mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-900 tracking-wide">
              Live College Audience Engagement
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 text-balance leading-[1.1] max-w-4xl">
            Make Your Voice <span className="text-indigo-600">Count</span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl text-balance leading-relaxed">
            A simple and fast platform for live college voting and audience participation. Designed for classrooms, seminars, college fests, hackathons, and campus events.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/host"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white clay-btn-primary rounded-2xl flex items-center justify-center gap-2.5 shadow-lg group cursor-pointer"
            >
              <span>Host a Poll</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#join-section"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-800 clay-btn-secondary rounded-2xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Join a Poll</span>
            </a>
          </div>

          {/* Quick Join Input Box */}
          <div id="join-section" className="mt-12 w-full max-w-md">
            <div className="clay-card p-6 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                Have a 6-digit room code?
              </span>
              <form onSubmit={handleJoinSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setCodeError('');
                  }}
                  placeholder="e.g. TECH26"
                  maxLength={10}
                  className="flex-1 px-4 py-3 text-base font-mono font-bold tracking-widest uppercase rounded-xl clay-input text-slate-900"
                />
                <button
                  type="submit"
                  className="px-6 py-3 font-bold text-white clay-btn-primary rounded-xl shrink-0 cursor-pointer"
                >
                  Join
                </button>
              </form>
              {codeError && (
                <p className="text-xs text-rose-600 font-medium text-left">{codeError}</p>
              )}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Instant join — no student sign-in required</span>
                <span className="font-mono text-indigo-600 font-semibold">₹0 Budget</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Interactive Workflow */}
      <section className="py-16 bg-white/70 border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How Campus Vote Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Built for speed in college events and lectures with zero software installation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="clay-card p-6 flex flex-col items-start relative group hover:-translate-y-1 transition-transform duration-200">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-lg flex items-center justify-center mb-5 border border-indigo-100">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Create a Poll</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Enter your question and choose Multiple Choice, Yes/No, or a 1–5 Star Rating.
              </p>
            </div>

            {/* Step 2 */}
            <div className="clay-card p-6 flex flex-col items-start relative group hover:-translate-y-1 transition-transform duration-200">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 font-extrabold text-lg flex items-center justify-center mb-5 border border-violet-100">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Share the QR Code</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Display the generated QR code on screen or share the 6-digit code.
              </p>
            </div>

            {/* Step 3 */}
            <div className="clay-card p-6 flex flex-col items-start relative group hover:-translate-y-1 transition-transform duration-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center mb-5 border border-blue-100">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Students Vote</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Students scan on mobile and tap their choice. Duplicate submissions are automatically blocked.
              </p>
            </div>

            {/* Step 4 */}
            <div className="clay-card p-6 flex flex-col items-start relative group hover:-translate-y-1 transition-transform duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-lg flex items-center justify-center mb-5 border border-emerald-100">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">See Live Results</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Watch percentages and averages update live in real-time, or launch Presentation Mode for projectors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="clay-card p-8 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mb-5 shadow-md shadow-indigo-500/25">
                <Presentation className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Live Presentation Mode</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A distraction-free, high-contrast display designed for projectors and large screens. Visible from anywhere in the room.
              </p>
            </div>

            <div className="clay-card p-8 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-violet-500 text-white flex items-center justify-center mb-5 shadow-md shadow-violet-500/25">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Anti-Spam Vote Protection</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Strict duplicate vote prevention guards against double submissions from rapid refreshing without invasive student tracking.
              </p>
            </div>

            <div className="clay-card p-8 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-5 shadow-md shadow-blue-500/25">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Mobile Touch-First Voting</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No app install, no logins, no barrier to entry. Students open the link in any mobile browser and cast a vote in under 3 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Demo Sandbox Showcase */}
      <section className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="clay-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-white via-indigo-50/20 to-white">
            <div className="flex flex-col gap-2 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Ready to Try Immediately</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Explore the Host Dashboard
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Test active live polls, launch presentation mode, or create a brand new poll for your upcoming class or symposium.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <Link
                to="/host"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white clay-btn-primary rounded-xl text-center"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/create-poll"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-slate-800 clay-btn-secondary rounded-xl text-center"
              >
                + New Poll
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
