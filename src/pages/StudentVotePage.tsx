import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Vote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { Poll } from '../types/poll';
import {
  getPoll,
  hasUserVoted,
  submitResponse,
  subscribeToPollUpdates,
} from '../lib/pollService';
import { getLocalVoteRecord } from '../lib/participant';

export const StudentVotePage: React.FC = () => {
  const { pollId } = useParams<{ pollId: string }>();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [voteSummary, setVoteSummary] = useState<string>('');

  // Form selections
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const checkStatus = async () => {
    if (!pollId) return;
    try {
      const p = await getPoll(pollId);
      setPoll(p);

      if (p) {
        const voted = await hasUserVoted(p.id);
        setAlreadyVoted(voted);

        const localRec = getLocalVoteRecord(p.id);
        if (localRec) {
          setVoteSummary(localRec.choiceSummary);
        }
      }
    } catch (err) {
      console.error('Error fetching poll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    if (!pollId) return;

    // Listen for live updates (e.g. host starts or closes the poll)
    const unsubscribe = subscribeToPollUpdates(pollId, () => {
      checkStatus();
    });

    return () => {
      unsubscribe();
    };
  }, [pollId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll) return;

    setErrorMessage('');

    if (poll.type === 'multiple_choice' && !selectedOptionId) {
      setErrorMessage('Please select one of the options.');
      return;
    }

    if (poll.type === 'yes_no' && !selectedOptionId) {
      setErrorMessage('Please tap YES or NO.');
      return;
    }

    if (poll.type === 'rating' && !selectedRating) {
      setErrorMessage('Please select a star rating from 1 to 5.');
      return;
    }

    let summary = '';
    if (poll.type === 'rating' && selectedRating) {
      summary = `${selectedRating} Star${selectedRating > 1 ? 's' : ''}`;
    } else if (selectedOptionId && poll.options) {
      const opt = poll.options.find((o) => o.id === selectedOptionId);
      summary = opt ? opt.option_text : 'Option Selected';
    }

    setSubmitting(true);
    try {
      const res = await submitResponse({
        pollId: poll.id,
        optionId: selectedOptionId || undefined,
        ratingValue: selectedRating || undefined,
        choiceSummary: summary,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to submit response.');
      } else {
        setVoteSummary(summary);
        setSubmittedSuccess(true);
        setAlreadyVoted(true);

        // Fire celebratory confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#4F46E5', '#10B981', '#F59E0B', '#6366F1'],
          });
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('An unexpected network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-spin mb-4">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-500">Connecting to poll...</p>
      </div>
    );
  }

  // Not Found State
  if (!poll) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center p-4">
        <div className="clay-card p-8 max-w-sm w-full text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Poll Not Found</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Please check the 6-character code or scan the QR code from the screen again.
          </p>
          <Link
            to="/"
            className="w-full py-3 text-xs font-bold text-white clay-btn-primary rounded-xl"
          >
            Enter Another Code
          </Link>
        </div>
      </div>
    );
  }

  // Submitted or Already Voted State
  if (submittedSuccess || alreadyVoted) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center p-4">
        <div className="clay-card p-8 max-w-md w-full text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100 shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full mb-3">
            Vote Recorded
          </span>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Response submitted successfully!
          </h1>

          <p className="text-sm text-slate-500 mt-2 mb-6">
            Thank you for participating. Look at the presentation screen to see the live results!
          </p>

          {voteSummary && (
            <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 flex flex-col items-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Your Answer
              </span>
              <span className="text-base font-bold text-indigo-600 mt-1">
                {voteSummary}
              </span>
            </div>
          )}

          <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Campus Vote</span>
            <span>Duplicate voting protected</span>
          </div>
        </div>
      </div>
    );
  }

  // Poll Closed State
  if (poll.status === 'closed') {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center p-4">
        <div className="clay-card p-8 max-w-sm w-full text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            This poll has ended.
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            The host has closed voting for this question. No additional responses can be submitted.
          </p>
          <Link
            to={`/poll/${poll.id}/results`}
            className="w-full py-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            View Final Results
          </Link>
        </div>
      </div>
    );
  }

  // Poll Draft State (Waiting for host)
  if (poll.status === 'draft') {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex flex-col items-center justify-center p-4">
        <div className="clay-card p-8 max-w-sm w-full text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100 animate-pulse">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Poll hasn't started yet
          </h2>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Waiting for the host or professor to open voting. This page will update automatically when the poll starts!
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span>Standing by...</span>
          </div>
        </div>
      </div>
    );
  }

  // Active Poll: The Student Voting Experience
  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        {/* Header / Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-indigo-600 tracking-wider uppercase mb-1">
            <Vote className="w-4 h-4" />
            <span>Campus Vote</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Room Code: {poll.join_code}
          </p>
        </div>

        {/* Voting Card */}
        <div className="clay-card p-6 sm:p-8">
          {/* Poll Title & Question */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {poll.title}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {poll.question}
            </h1>
          </div>

          {/* Validation / Submission Error */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 1. YES / NO Question Controls */}
            {poll.type === 'yes_no' && (
              <div className="grid grid-cols-2 gap-4">
                {/* YES Option */}
                {(() => {
                  const yesOpt = poll.options?.find((o) => o.option_text.toLowerCase() === 'yes') || poll.options?.[0];
                  const isSelected = selectedOptionId === yesOpt?.id;

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (yesOpt) setSelectedOptionId(yesOpt.id);
                        setErrorMessage('');
                      }}
                      className={`p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-[0_8px_24px_rgba(16,185,129,0.35)] scale-[1.02]'
                          : 'clay-btn-secondary hover:border-emerald-300 text-slate-800'
                      }`}
                    >
                      <ThumbsUp className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                      <span className="text-xl font-extrabold tracking-wider">YES</span>
                    </button>
                  );
                })()}

                {/* NO Option */}
                {(() => {
                  const noOpt = poll.options?.find((o) => o.option_text.toLowerCase() === 'no') || poll.options?.[1];
                  const isSelected = selectedOptionId === noOpt?.id;

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (noOpt) setSelectedOptionId(noOpt.id);
                        setErrorMessage('');
                      }}
                      className={`p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-[0_8px_24px_rgba(244,63,94,0.35)] scale-[1.02]'
                          : 'clay-btn-secondary hover:border-rose-300 text-slate-800'
                      }`}
                    >
                      <ThumbsDown className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-rose-600'}`} />
                      <span className="text-xl font-extrabold tracking-wider">NO</span>
                    </button>
                  );
                })()}
              </div>
            )}

            {/* 2. Multiple Choice Options */}
            {poll.type === 'multiple_choice' && (
              <div className="flex flex-col gap-3">
                {poll.options?.map((opt, index) => {
                  const isSelected = selectedOptionId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedOptionId(opt.id);
                        setErrorMessage('');
                      }}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'clay-choice-card-selected'
                          : 'clay-choice-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-semibold ${
                            isSelected ? 'text-indigo-950 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {opt.option_text}
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. Rating System (1–5 Stars) */}
            {poll.type === 'rating' && (
              <div className="flex flex-col items-center gap-5 py-4">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isSelected = selectedRating === starVal;
                    const isFilled = (selectedRating ?? 0) >= starVal;

                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => {
                          setSelectedRating(starVal);
                          setErrorMessage('');
                        }}
                        className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                            : 'clay-btn-secondary hover:border-amber-300'
                        }`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${
                            isFilled
                              ? isSelected
                                ? 'fill-white text-white'
                                : 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                        <span className="font-mono text-xs font-bold">{starVal}</span>
                      </button>
                    );
                  })}
                </div>

                <span className="text-xs font-medium text-slate-500">
                  {selectedRating
                    ? `Selected: ${selectedRating} of 5 Stars`
                    : 'Tap a star to rate'}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-base font-bold text-white clay-btn-primary rounded-2xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <span>{submitting ? 'Submitting Vote...' : 'Submit Response'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Small Privacy Note */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          One vote per device · Anonymous participation
        </p>
      </div>
    </div>
  );
};
