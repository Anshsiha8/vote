import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Vote,
  BarChart3,
  Presentation,
  Users,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  QrCode,
  Share2,
} from 'lucide-react';
import { Poll, PollResults } from '../types/poll';
import { getPoll, getPollResults, subscribeToPollUpdates } from '../lib/pollService';
import { ResultChart } from '../components/ResultChart';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

export const LiveResultsPage: React.FC = () => {
  const { pollId } = useParams<{ pollId: string }>();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const loadData = async () => {
    if (!pollId) return;
    try {
      const p = await getPoll(pollId);
      if (p) {
        setPoll(p);
        const res = await getPollResults(p.id);
        setResults(res);
        // Pulse animation on update
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 800);
      }
    } catch (err) {
      console.error('Error fetching live results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (!pollId) return;

    // Real-time subscription without manual refresh!
    const unsubscribe = subscribeToPollUpdates(pollId, () => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, [pollId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-spin mb-4">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading live results...</p>
      </div>
    );
  }

  if (!poll || !results) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="clay-card p-8 flex flex-col items-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Poll Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The requested poll results are unavailable.
          </p>
          <Link to="/host" className="px-5 py-2.5 text-xs font-bold text-white clay-btn-primary rounded-xl">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            to={`/poll/${poll.id}/room`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Poll Room</span>
          </Link>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span
              className={`w-2 h-2 rounded-full bg-emerald-500 ${
                isPulsing ? 'scale-150 animate-ping' : ''
              }`}
            />
            <span>Live Sync Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 clay-btn-secondary rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Show QR</span>
          </button>

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
      </div>

      {/* Main Results Container */}
      <div className="clay-card p-6 sm:p-10 flex flex-col gap-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              {poll.title}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {poll.question}
            </h1>
          </div>

          {/* Response Count Pill */}
          <div className="flex items-center gap-2 self-start bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl shrink-0">
            <Users className="w-4 h-4 text-indigo-600" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                Total Responses
              </span>
              <span className="text-xl font-extrabold font-mono text-indigo-950 tabular-nums">
                {results.totalResponses}
              </span>
            </div>
          </div>
        </div>

        {/* Charts & Visual Results */}
        {results.totalResponses === 0 ? (
          <div className="py-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No Responses Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
              Show the QR code to your audience to start collecting live feedback.
            </p>
            <button
              onClick={() => setShowQrModal(true)}
              className="mt-6 px-6 py-2.5 text-xs font-bold text-white clay-btn-primary rounded-xl"
            >
              Show Screen QR Code
            </button>
          </div>
        ) : (
          <ResultChart results={results} presentation={false} />
        )}

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Updates automatically with zero manual refresh</span>
          <span className="font-mono">Poll Code: {poll.join_code}</span>
        </div>
      </div>

      {/* QR Code Quick Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center">
            <h3 className="text-base font-bold text-slate-900 mb-1 text-center">
              {poll.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4 text-center">
              Room join code: <span className="font-mono font-bold text-indigo-600">{poll.join_code}</span>
            </p>

            <QRCodeDisplay
              pollId={poll.id}
              joinCode={poll.join_code}
              size={200}
            />

            <button
              onClick={() => setShowQrModal(false)}
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
