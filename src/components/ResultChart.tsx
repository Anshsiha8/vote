import React from 'react';
import { PollResults } from '../types/poll';
import { Star, CheckCircle, ThumbsUp, ThumbsDown, Users } from 'lucide-react';

interface ResultChartProps {
  results: PollResults;
  presentation?: boolean;
}

export const ResultChart: React.FC<ResultChartProps> = ({ results, presentation = false }) => {
  const { poll, totalResponses, options, averageRating, ratingBreakdown } = results;

  // Render Yes/No Visualization
  if (poll.type === 'yes_no') {
    const yesOption = options.find((o) => o.text.toLowerCase() === 'yes') || options[0];
    const noOption = options.find((o) => o.text.toLowerCase() === 'no') || options[1];

    const yesPercent = yesOption ? yesOption.percentage : 0;
    const noPercent = noOption ? noOption.percentage : 0;
    const yesCount = yesOption ? yesOption.count : 0;
    const noCount = noOption ? noOption.count : 0;

    return (
      <div className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {/* YES CARD */}
          <div
            className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col items-center text-center ${
              presentation
                ? 'bg-emerald-950/40 border-2 border-emerald-500/30'
                : 'clay-card bg-gradient-to-b from-emerald-50/50 to-white border-emerald-200/60'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-3">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <span
              className={`text-sm sm:text-base font-bold tracking-wide uppercase ${
                presentation ? 'text-emerald-400' : 'text-emerald-800'
              }`}
            >
              YES
            </span>
            <span
              className={`font-extrabold tracking-tight font-mono tabular-nums my-2 ${
                presentation ? 'text-6xl sm:text-7xl text-emerald-300' : 'text-5xl sm:text-6xl text-emerald-600'
              }`}
            >
              {yesPercent}%
            </span>
            <span className={`text-xs sm:text-sm font-mono ${presentation ? 'text-emerald-200/70' : 'text-slate-500'}`}>
              {yesCount} {yesCount === 1 ? 'vote' : 'votes'}
            </span>
          </div>

          {/* NO CARD */}
          <div
            className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col items-center text-center ${
              presentation
                ? 'bg-rose-950/40 border-2 border-rose-500/30'
                : 'clay-card bg-gradient-to-b from-rose-50/50 to-white border-rose-200/60'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 mb-3">
              <ThumbsDown className="w-6 h-6" />
            </div>
            <span
              className={`text-sm sm:text-base font-bold tracking-wide uppercase ${
                presentation ? 'text-rose-400' : 'text-rose-800'
              }`}
            >
              NO
            </span>
            <span
              className={`font-extrabold tracking-tight font-mono tabular-nums my-2 ${
                presentation ? 'text-6xl sm:text-7xl text-rose-300' : 'text-5xl sm:text-6xl text-rose-600'
              }`}
            >
              {noPercent}%
            </span>
            <span className={`text-xs sm:text-sm font-mono ${presentation ? 'text-rose-200/70' : 'text-slate-500'}`}>
              {noCount} {noCount === 1 ? 'vote' : 'votes'}
            </span>
          </div>
        </div>

        {/* Combined Dual Progress Track */}
        <div className="w-full">
          <div className="h-6 sm:h-8 w-full bg-slate-200/70 rounded-full overflow-hidden flex p-1 shadow-inner">
            <div
              className="bg-emerald-500 h-full rounded-l-full transition-all duration-500 ease-out"
              style={{ width: `${totalResponses === 0 ? 50 : yesPercent}%` }}
            />
            <div
              className="bg-rose-500 h-full rounded-r-full transition-all duration-500 ease-out"
              style={{ width: `${totalResponses === 0 ? 50 : noPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Render Multiple Choice Visualization
  if (poll.type === 'multiple_choice') {
    const highestCount = Math.max(...options.map((o) => o.count), 0);

    return (
      <div className="w-full flex flex-col gap-4">
        {options.map((opt) => {
          const isLeader = highestCount > 0 && opt.count === highestCount;

          return (
            <div
              key={opt.id}
              className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 ${
                presentation
                  ? 'bg-slate-900/60 border border-slate-700/60'
                  : 'clay-card-flat bg-white border border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {isLeader && totalResponses > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                  )}
                  <span
                    className={`font-semibold truncate ${
                      presentation
                        ? 'text-xl sm:text-2xl text-white'
                        : 'text-base sm:text-lg text-slate-800'
                    }`}
                  >
                    {opt.text}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 shrink-0">
                  <span
                    className={`font-extrabold font-mono tabular-nums ${
                      presentation
                        ? 'text-2xl sm:text-3xl text-indigo-300'
                        : 'text-xl sm:text-2xl text-indigo-600'
                    }`}
                  >
                    {opt.percentage}%
                  </span>
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      presentation ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    ({opt.count})
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                className={`w-full h-4 sm:h-5 rounded-xl overflow-hidden p-0.5 ${
                  presentation ? 'bg-slate-800' : 'bg-slate-100 shadow-inner'
                }`}
              >
                <div
                  className={`h-full rounded-lg transition-all duration-500 ease-out ${
                    isLeader && totalResponses > 0
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm'
                      : presentation
                      ? 'bg-slate-600'
                      : 'bg-indigo-300'
                  }`}
                  style={{ width: `${Math.max(opt.percentage, 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Render Rating Visualization
  if (poll.type === 'rating') {
    const avg = averageRating ?? 0;
    const breakdown = ratingBreakdown || [];

    return (
      <div className="w-full flex flex-col gap-6">
        {/* Average Score Header */}
        <div
          className={`p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 ${
            presentation
              ? 'bg-slate-900/60 border border-slate-700/60'
              : 'clay-card bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/40'
          }`}
        >
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span
              className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${
                presentation ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Average Rating
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`font-mono font-extrabold tabular-nums tracking-tight ${
                  presentation ? 'text-6xl sm:text-7xl text-white' : 'text-5xl sm:text-6xl text-slate-900'
                }`}
              >
                {avg}
              </span>
              <span className={`text-xl font-mono ${presentation ? 'text-slate-500' : 'text-slate-400'}`}>
                / 5.0
              </span>
            </div>
          </div>

          {/* Star Icons representation */}
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-7 h-7 sm:w-9 sm:h-9 ${
                  star <= Math.round(avg)
                    ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 1 to 5 Distribution */}
        <div className="flex flex-col gap-3">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const row = breakdown.find((b) => b.rating === starNum) || {
              rating: starNum,
              count: 0,
              percentage: 0,
            };

            return (
              <div
                key={starNum}
                className={`flex items-center gap-3 p-3 px-4 rounded-xl ${
                  presentation ? 'bg-slate-900/40' : 'clay-card-flat bg-white'
                }`}
              >
                <div className="flex items-center gap-1 w-14 shrink-0 font-mono text-sm font-bold text-slate-700">
                  <span>{starNum}</span>
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </div>

                <div
                  className={`flex-1 h-3 rounded-full overflow-hidden ${
                    presentation ? 'bg-slate-800' : 'bg-slate-100 shadow-inner'
                  }`}
                >
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>

                <div className="w-20 text-right shrink-0">
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums ${
                      presentation ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {row.percentage}%
                  </span>
                  <span className={`text-[11px] font-mono ml-1.5 ${presentation ? 'text-slate-500' : 'text-slate-400'}`}>
                    ({row.count})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
