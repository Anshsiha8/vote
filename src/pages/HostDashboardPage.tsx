import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Vote,
  Plus,
  Play,
  Square,
  BarChart2,
  Presentation,
  QrCode,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Poll, PollStatus } from '../types/poll';
import { getPolls, updatePollStatus, deletePoll, getPollResults } from '../lib/pollService';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

interface HostDashboardPageProps {
  onOpenSupabaseModal?: () => void;
}

export const HostDashboardPage: React.FC<HostDashboardPageProps> = ({ onOpenSupabaseModal }) => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('all');
  const [selectedQrPoll, setSelectedQrPoll] = useState<Poll | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadPolls = async () => {
    try {
      const data = await getPolls();
      setPolls(data);

      // Fetch response counts in parallel
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (p) => {
          const res = await getPollResults(p.id);
          if (res) {
            counts[p.id] = res.totalResponses;
          }
        })
      );
      setResponseCounts(counts);
    } catch (err) {
      console.error('Failed to load polls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();

    // Listen for live updates so dashboard counts update dynamically
    const handleUpdate = () => {
      loadPolls();
    };
    window.addEventListener('campus_vote_update', handleUpdate);
    return () => {
      window.removeEventListener('campus_vote_update', handleUpdate);
    };
  }, []);

  const handleStatusChange = async (pollId: string, newStatus: PollStatus) => {
    setActionLoading(pollId);
    try {
      await updatePollStatus(pollId, newStatus);
      await loadPolls();
    } catch (err) {
      console.error('Status change error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (pollId: string) => {
    if (!window.confirm('Are you sure you want to delete this poll and all its responses?')) {
      return;
    }
    setActionLoading(pollId);
    try {
      await deletePoll(pollId);
      await loadPolls();
    } catch (err) {
      console.error('Delete poll error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPolls = polls.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Host Dashboard
            </h1>
            <button
              onClick={() => {
                setLoading(true);
                loadPolls();
              }}
              title="Refresh polls"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your audience polls, project live rooms, and view responses in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/create-poll"
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white clay-btn-primary rounded-xl flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Poll</span>
          </Link>
        </div>
      </div>

      {/* Interactive Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl">
          {(['all', 'active', 'draft', 'closed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
              {tab === 'all' && ` (${polls.length})`}
              {tab === 'active' && ` (${polls.filter((p) => p.status === 'active').length})`}
              {tab === 'draft' && ` (${polls.filter((p) => p.status === 'draft').length})`}
              {tab === 'closed' && ` (${polls.filter((p) => p.status === 'closed').length})`}
            </button>
          ))}
        </div>

        <span className="hidden sm:inline text-xs text-slate-400 font-mono">
          {filteredPolls.length} {filteredPolls.length === 1 ? 'poll' : 'polls'}
        </span>
      </div>

      {/* Polls Listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="clay-card p-6 h-64 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-4/5" />
                <div className="h-4 bg-slate-100 rounded w-full" />
              </div>
              <div className="h-10 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredPolls.length === 0 ? (
        /* Empty State */
        <div className="clay-card p-12 text-center max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100 shadow-inner">
            <Vote className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {filter === 'all' ? 'No polls created yet' : `No ${filter} polls found`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xs leading-relaxed">
            Create your first live question for a live presentation, lecture quiz, or college fest.
          </p>
          <Link
            to="/create-poll"
            className="mt-6 px-6 py-2.5 text-xs font-bold text-white clay-btn-primary rounded-xl"
          >
            Create Your First Poll
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll) => {
            const count = responseCounts[poll.id] ?? 0;
            const isProcessing = actionLoading === poll.id;

            return (
              <div
                key={poll.id}
                className="clay-card p-6 flex flex-col justify-between transition-all hover:-translate-y-1 duration-200"
              >
                <div>
                  {/* Top Bar with status & join code */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        poll.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : poll.status === 'draft'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {poll.status}
                    </span>

                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {poll.join_code}
                    </span>
                  </div>

                  {/* Title & Question */}
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {poll.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 min-h-[32px]">
                    {poll.question}
                  </p>

                  {/* Metadata Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-mono font-bold tabular-nums text-slate-800">
                        {count}
                      </span>
                      <span>{count === 1 ? 'response' : 'responses'}</span>
                    </div>

                    <span className="text-[11px] capitalize text-slate-400">
                      {poll.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/poll/${poll.id}/room`}
                      className="px-3 py-2 text-xs font-bold text-slate-700 clay-btn-secondary rounded-xl text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Poll Room</span>
                    </Link>

                    <Link
                      to={`/poll/${poll.id}/results`}
                      className="px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Live Results</span>
                    </Link>
                  </div>

                  {/* Quick Control Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      {poll.status === 'draft' && (
                        <button
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(poll.id, 'active')}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-600" />
                          <span>Start</span>
                        </button>
                      )}

                      {poll.status === 'active' && (
                        <button
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(poll.id, 'closed')}
                          className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold cursor-pointer disabled:opacity-50"
                        >
                          <Square className="w-3.5 h-3.5 fill-rose-600" />
                          <span>Close</span>
                        </button>
                      )}

                      {poll.status === 'closed' && (
                        <button
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(poll.id, 'active')}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reopen</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedQrPoll(poll)}
                        className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 cursor-pointer ml-2"
                        title="Display QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR</span>
                      </button>

                      <Link
                        to={`/poll/${poll.id}/present`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 ml-2"
                        title="Open Live Presentation Mode"
                      >
                        <Presentation className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </Link>
                    </div>

                    <button
                      onClick={() => handleDelete(poll.id)}
                      disabled={isProcessing}
                      title="Delete Poll"
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Quick Modal */}
      {selectedQrPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center">
            <h3 className="text-base font-bold text-slate-900 mb-1 text-center">
              {selectedQrPoll.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4 text-center">
              Scan to join this live poll
            </p>

            <QRCodeDisplay
              pollId={selectedQrPoll.id}
              joinCode={selectedQrPoll.join_code}
              size={200}
            />

            <button
              onClick={() => setSelectedQrPoll(null)}
              className="mt-6 w-full py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
