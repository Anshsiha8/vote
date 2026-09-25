import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Vote,
  Play,
  Square,
  BarChart2,
  Presentation,
  Copy,
  Check,
  Users,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { Poll, PollResults, PollStatus } from '../types/poll';
import {
  getPoll,
  getPollResults,
  updatePollStatus,
  subscribeToPollUpdates,
} from '../lib/pollService';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { ResultChart } from '../components/ResultChart';

export const PollRoomPage: React.FC = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadData = async () => {
    if (!pollId) return;
    try {
      const p = await getPoll(pollId);
      if (p) {
        setPoll(p);
        const res = await getPollResults(p.id);
        setResults(res);
      }
    } catch (err) {
      console.error('Error loading poll room data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (!pollId) return;

    // Realtime subscription: updates when students vote
    const unsubscribe = subscribeToPollUpdates(pollId, () => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, [pollId]);

  const handleStatusChange = async (newStatus: PollStatus) => {
    if (!poll) return;
    setActionLoading(true);
    try {
      const updated = await updatePollStatus(poll.id, newStatus);
      if (updated) {
        setPoll(updated);
        const res = await getPollResults(updated.id);
        setResults(res);
      }
    } catch (err) {
      console.error('Failed to change poll status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const votingUrl = typeof window !== 'undefined' && poll ? `${window.location.origin}/poll/${poll.id}` : '';

  const handleCopyLink = async () => {
    if (!votingUrl) return;
    try {
      await navigator.clipboard.writeText(votingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-spin mb-4">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading poll room...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="clay-card p-8 flex flex-col items-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Poll Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The requested poll room does not exist or has been removed.
          </p>
          <Link to="/host" className="px-5 py-2.5 text-xs font-bold text-white clay-btn-primary rounded-xl">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back and Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/host"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Host Dashboard</span>
        </Link>

        {/* Live Presentation Button */}
        <Link
          to={`/poll/${poll.id}/present`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-xs font-bold text-white clay-btn-primary rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Presentation className="w-4 h-4" />
          <span>Presentation Mode</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </Link>
      </div>

      {/* Main Room Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Poll Info & QR Code (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Card: Poll Status & Controls */}
          <div className="clay-card p-6 sm:p-7 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  poll.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                    : poll.status === 'draft'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {poll.status === 'active' ? '● Live Voting Active' : poll.status}
              </span>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-mono tabular-nums text-slate-900 font-bold">
                  {results ? results.totalResponses : 0}
                </span>
                <span>votes</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {poll.title}
              </h1>
              <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                "{poll.question}"
              </p>
            </div>

            {/* Status Change Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              {poll.status === 'draft' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange('active')}
                  className="flex-1 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Poll (Open for Students)</span>
                </button>
              )}

              {poll.status === 'active' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange('closed')}
                  className="flex-1 py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Close Poll (Stop Responses)</span>
                </button>
              )}

              {poll.status === 'closed' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange('active')}
                  className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reopen Poll</span>
                </button>
              )}
            </div>
          </div>

          {/* Card: High Density QR Code */}
          <div className="clay-card p-6 sm:p-7 flex flex-col items-center w-full overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Audience QR Code
            </h3>
            <p className="text-xs text-slate-500 mb-4 text-center">
              Display this on screen for students and attendees to scan
            </p>

            <QRCodeDisplay
              pollId={poll.id}
              joinCode={poll.join_code}
              size={200}
              showDetails={true}
            />
          </div>
        </div>

        {/* Right Column: Live Results Stream (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="clay-card p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Live Response Results
                  </h2>
                  <p className="text-xs text-slate-500">
                    Updates in real-time as students submit their answers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/poll/${poll.id}/results`}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Full Results Page
                </Link>
              </div>
            </div>

            {/* Results Chart Display */}
            {results && results.totalResponses > 0 ? (
              <ResultChart results={results} presentation={false} />
            ) : (
              <div className="py-16 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Waiting for First Responses...
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  {poll.status === 'active'
                    ? 'Share the QR code with your audience. Results will stream in automatically.'
                    : 'The poll is currently in draft. Click "Start Poll" to begin accepting responses.'}
                </p>

                {poll.status === 'active' && (
                  <a
                    href={votingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Cast a test vote now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
