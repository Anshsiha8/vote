import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Vote,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Star,
  ListOrdered,
  ToggleLeft,
} from 'lucide-react';
import { PollType } from '../types/poll';
import { createPoll } from '../lib/pollService';

export const CreatePollPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<PollType>('multiple_choice');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick preset templates
  const applyPreset = (presetType: PollType) => {
    if (presetType === 'yes_no') {
      setTitle('Algorithm Comprehension Check');
      setQuestion('Was the time complexity derivation for Dijkstra clear?');
      setType('yes_no');
    } else if (presetType === 'multiple_choice') {
      setTitle('College Hackathon Track Vote');
      setQuestion('Which domain should be the theme for this weekend’s 24-hour hackathon?');
      setType('multiple_choice');
      setOptions([
        'AI & Machine Learning Agents',
        'Decentralized Web & Blockchain',
        'Healthcare & Assistive Tech',
        'Clean Energy & Smart Cities',
      ]);
    } else if (presetType === 'rating') {
      setTitle('Keynote & Seminar Evaluation');
      setQuestion('How would you rate today’s tech keynote speaker on a scale of 1 to 5?');
      setType('rating');
    }
    setErrorMessage('');
  };

  const handleAddOption = () => {
    if (options.length >= 8) {
      setErrorMessage('A maximum of 8 options is recommended for screen readability.');
      return;
    }
    setOptions([...options, '']);
    setErrorMessage('');
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setErrorMessage('Multiple choice polls require at least 2 options.');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setErrorMessage('');
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!title.trim()) {
      setErrorMessage('Please enter a poll title.');
      return;
    }

    if (!question.trim()) {
      setErrorMessage('Please enter a question for your audience.');
      return;
    }

    if (type === 'multiple_choice') {
      const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
      if (cleanOptions.length < 2) {
        setErrorMessage('Please provide at least 2 non-empty options.');
        return;
      }
      // Check for duplicates
      const unique = new Set(cleanOptions.map((o) => o.toLowerCase()));
      if (unique.size !== cleanOptions.length) {
        setErrorMessage('Duplicate options detected. Please make sure all options are unique.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const cleanOptions = type === 'multiple_choice' ? options.map((o) => o.trim()).filter(Boolean) : [];
      const newPoll = await createPoll({
        title,
        question,
        type,
        options: cleanOptions,
      });

      // Navigate to Poll Room
      navigate(`/poll/${newPoll.id}/room`);
    } catch (err) {
      console.error('Failed to create poll:', err);
      setErrorMessage('An unexpected error occurred while creating the poll. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/host"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Host Dashboard</span>
        </Link>
      </div>

      <div className="clay-card p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create a New Poll
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Design a question for your students or audience to answer from their phones.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('multiple_choice')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              MCQ
            </button>
            <button
              type="button"
              onClick={() => applyPreset('yes_no')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Yes/No
            </button>
            <button
              type="button"
              onClick={() => applyPreset('rating')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Rating
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Poll Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Poll Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Freshers Orientation Feedback or CS301 Quick Quiz"
              className="w-full px-4 py-3 text-sm rounded-xl clay-input text-slate-900 font-medium placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              A short descriptive label displayed at the top of the voting screen.
            </p>
          </div>

          {/* Question */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Question for Audience
            </label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which programming language do you prefer for coding competitions?"
              className="w-full px-4 py-3 text-sm rounded-xl clay-input text-slate-900 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Question Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Question Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Multiple Choice Card */}
              <button
                type="button"
                onClick={() => setType('multiple_choice')}
                className={`p-4 rounded-2xl flex flex-col items-start gap-2 border text-left cursor-pointer transition-all ${
                  type === 'multiple_choice'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-[0_6px_20px_rgba(79,70,229,0.12)]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <ListOrdered className="w-5 h-5 text-indigo-600" />
                  {type === 'multiple_choice' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Multiple Choice
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    2 to 8 customizable options
                  </span>
                </div>
              </button>

              {/* Yes / No Card */}
              <button
                type="button"
                onClick={() => setType('yes_no')}
                className={`p-4 rounded-2xl flex flex-col items-start gap-2 border text-left cursor-pointer transition-all ${
                  type === 'yes_no'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-[0_6px_20px_rgba(16,185,129,0.12)]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <ToggleLeft className="w-5 h-5 text-emerald-600" />
                  {type === 'yes_no' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Yes / No
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Automatic Yes & No choices
                  </span>
                </div>
              </button>

              {/* Rating Card */}
              <button
                type="button"
                onClick={() => setType('rating')}
                className={`p-4 rounded-2xl flex flex-col items-start gap-2 border text-left cursor-pointer transition-all ${
                  type === 'rating'
                    ? 'border-amber-500 bg-amber-50/60 shadow-[0_6px_20px_rgba(245,158,11,0.12)]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  {type === 'rating' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Rating (1–5 ⭐)
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Audience rates on a 5-star scale
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Options Editor for Multiple Choice */}
          {type === 'multiple_choice' && (
            <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Poll Options ({options.length})
                </span>
                <span className="text-xs text-slate-400">At least 2 required</span>
              </div>

              <div className="flex flex-col gap-3">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-400">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl clay-input bg-white font-medium"
                    />
                    <button
                      type="button"
                      disabled={options.length <= 2}
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {options.length < 8 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-2 py-2.5 px-4 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50/80 border border-dashed border-indigo-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Option</span>
                </button>
              )}
            </div>
          )}

          {/* Explanation for Yes/No */}
          {type === 'yes_no' && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 text-emerald-900 text-xs flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Campus Vote will automatically present two large touch-friendly buttons (<strong>YES</strong> and <strong>NO</strong>) to students. No manual configuration needed.
              </span>
            </div>
          )}

          {/* Explanation for Rating */}
          {type === 'rating' && (
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-amber-900 text-xs flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
              <span>
                Students will be presented with a 1–5 star rating picker on mobile. The live results will calculate the real-time average score and distribution.
              </span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/host"
              className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 text-sm font-bold text-white clay-btn-primary rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Creating Poll...' : 'Create Poll & Enter Room'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
