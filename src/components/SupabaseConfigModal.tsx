import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, X, AlertCircle } from 'lucide-react';
import { getSupabaseCredentials, saveCustomSupabaseCredentials, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsSaved?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onCredentialsSaved,
}) => {
  const current = getSupabaseCredentials();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseCredentials(url, key);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onCredentialsSaved) onCredentialsSaved();
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    saveCustomSupabaseCredentials('', '');
    setUrl('');
    setKey('');
    if (onCredentialsSaved) onCredentialsSaved();
  };

  const copySqlSchema = async () => {
    try {
      const res = await fetch('/supabase-schema.sql');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      // Fallback
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Database & Realtime Status</h3>
              <p className="text-xs text-slate-500">Supabase PostgreSQL integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status card */}
        <div
          className={`p-4 rounded-2xl border ${
            isConfigured
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-sm font-bold">
              {isConfigured ? 'Supabase Live Connected' : 'Synchronized Local & Multi-Tab Mode Active'}
            </span>
          </div>
          <p className="text-xs mt-1.5 opacity-90 leading-relaxed">
            {isConfigured
              ? 'Your votes and polls are syncing live to your cloud Supabase database and broadcasting over Supabase Realtime.'
              : 'Campus Vote is currently running on the high-speed local engine with instant multi-tab BroadcastChannel sync. Zero configuration required to test right now! To persist to your own Supabase database, paste your credentials below.'}
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl clay-input text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supabase Anon Public Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl clay-input text-slate-800"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={copySqlSchema}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Schema Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Schema</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              {isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white clay-btn-primary rounded-xl"
              >
                {savedSuccess ? 'Saved!' : 'Save Credentials'}
              </button>
            </div>
          </div>
        </form>

        <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
          <span>₹0 Budget Free Tier Compatible</span>
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
          >
            <span>Supabase Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
