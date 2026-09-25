import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Vote,
  Users,
  Maximize2,
  Minimize2,
  Sparkles,
  RefreshCw,
  QrCode,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import { Poll, PollResults } from '../types/poll';
import { getPoll, getPollResults, subscribeToPollUpdates } from '../lib/pollService';
import { ResultChart } from '../components/ResultChart';

export const PresentationMode: React.FC = () => {
  const { pollId } = useParams<{ pollId: string }>();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pulse, setPulse] = useState(false);

  const loadData = async () => {
    if (!pollId) return;
    try {
      const p = await getPoll(pollId);
      if (p) {
        setPoll(p);
        const res = await getPollResults(p.id);
        setResults(res);
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
      }
    } catch (err) {
      console.error('Presentation mode error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (!pollId) return;

    // Real-time synchronization for live display
    const unsubscribe = subscribeToPollUpdates(pollId, () => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, [pollId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Handle escape key to close QR modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showQrModal) {
        setShowQrModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQrModal]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const votingUrl = poll ? `${origin}/poll/${poll.id}` : '';

  const handleCopyLink = async () => {
    if (!votingUrl) return;
    try {
      await navigator.clipboard.writeText(votingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = votingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-spin mb-4">
          <RefreshCw className="w-8 h-8" />
        </div>
        <p className="text-base font-medium text-slate-400">Loading live presentation...</p>
      </div>
    );
  }

  if (!poll || !results) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Poll Not Found</h1>
        <p className="text-sm text-slate-400 mb-6">The requested poll could not be loaded.</p>
        <Link to="/host" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar for Projector */}
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        {/* Left: Branding & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Campus Vote
            </span>
            <span className="hidden lg:inline ml-3 text-xs font-mono text-slate-400 tracking-wider uppercase">
              Live Presentation Display
            </span>
          </div>
        </div>

        {/* Right: Controls, Separate QR Code Button, Separate Link Button, Fullscreen, and Exit */}
        <div className="flex items-center gap-3">
          {/* Join Code Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs sm:text-sm">
            <span className="text-slate-500 text-xs uppercase font-sans font-bold">Code:</span>
            <span className="text-indigo-400 font-extrabold tracking-wider">{poll.join_code}</span>
          </div>

          {/* Separate Button 1: QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl border border-indigo-500/50 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer whitespace-nowrap"
            title="Display Large Screen QR Code"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>

          {/* Separate Button 2: Link Button */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              copiedLink
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600 active:scale-95'
            }`}
            title="Copy Public Voting Link"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Back to Poll Room */}
          <Link
            to={`/poll/${poll.id}/room`}
            className="p-2.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title="Return to Host Poll Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-8 md:py-12 flex flex-col justify-center">
        {/* Question Header */}
        <div className="mb-10 text-center sm:text-left">
          <span className="text-sm sm:text-base font-bold text-indigo-400 uppercase tracking-widest block mb-2">
            {poll.title}
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
            {poll.question}
          </h1>
        </div>

        {/* Big Large-Screen Visualization */}
        <div className="w-full">
          {results.totalResponses === 0 ? (
            <div className="p-14 sm:p-20 rounded-3xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-900 text-indigo-400 flex items-center justify-center mb-6 border border-slate-800 shadow-inner">
                <Users className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Waiting for Audience Votes...
              </h2>
              <p className="text-base text-slate-400 max-w-md mb-8">
                Click the <strong>QR Code</strong> button or share the link with your students to begin collecting responses.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Show Large QR Code</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Voting Link'}</span>
                </button>
              </div>
            </div>
          ) : (
            <ResultChart results={results} presentation={true} />
          )}
        </div>
      </main>

      {/* Bottom Bar: Live Counter & Separate Action Buttons */}
      <footer className="px-6 sm:px-12 py-5 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-20">
        {/* Realtime Live Counter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3.5 h-3.5 rounded-full bg-emerald-500 ${
                pulse ? 'animate-ping scale-150' : 'animate-pulse'
              }`}
            />
            <span className="text-sm font-semibold tracking-wide text-slate-300">
              Live Realtime Feed
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {results.totalResponses}
            </span>
            <span className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider font-sans font-semibold">
              {results.totalResponses === 1 ? 'Response' : 'Responses'}
            </span>
          </div>
        </div>

        {/* Bottom Separate Buttons: QR Code Button and Link Button */}
        <div className="flex items-center gap-3">
          {/* Button 1: QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2 px-3.5 rounded-2xl shadow-lg transition-all cursor-pointer text-left group"
          >
            <div className="bg-white p-1 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
              <QRCodeSVG
                value={votingUrl}
                size={32}
                level="M"
                fgColor="#0B0F19"
                bgColor="#FFFFFF"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Screen QR
              </span>
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                <span>Enlarge QR</span>
                <Maximize2 className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* Button 2: Separate Link Button */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2.5 border p-2.5 px-4 rounded-2xl shadow-lg transition-all cursor-pointer text-left ${
              copiedLink
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 shrink-0">
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Voting Link
              </span>
              <span className="text-xs font-mono font-bold truncate max-w-[150px] sm:max-w-[200px]">
                {copiedLink ? 'Copied to Clipboard!' : votingUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>
          </button>
        </div>
      </footer>

      {/* Large Projector Screen QR Code Modal */}
      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(79,70,229,0.3)] flex flex-col items-center relative animate-in zoom-in-95 duration-150"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
              Live Screen Join
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white text-center mb-1 line-clamp-1">
              {poll.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 text-center mb-6">
              Scan with your phone camera to cast your vote
            </p>

            {/* High-Clarity Big QR Code Box */}
            <div className="p-4 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
              <div className="p-2 bg-slate-50 rounded-2xl">
                <QRCodeSVG
                  value={votingUrl}
                  size={260}
                  level="H"
                  fgColor="#0B0F19"
                  bgColor="#FFFFFF"
                />
              </div>

              {/* Screen Join Code */}
              <div className="mt-4 flex flex-col items-center text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  6-Digit Join Code
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-extrabold text-indigo-600 tracking-widest mt-0.5">
                  {poll.join_code}
                </span>
              </div>
            </div>

            {/* Direct Join Link & Copy Button */}
            <div className="w-full mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 p-2 pl-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs">
                <span className="text-slate-300 font-mono text-[11px] truncate flex-1">
                  {votingUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-1">
                <span>Live presentation mode</span>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  Back to Results (Esc)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
