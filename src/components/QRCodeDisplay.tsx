import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  pollId: string;
  joinCode: string;
  size?: number;
  showDetails?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  pollId,
  joinCode,
  size = 200,
  showDetails = true,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute public student URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const votingUrl = `${origin}/poll/${pollId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(votingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = votingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Unified clean container for QR code, join code, and copy link */}
      <div className="w-full max-w-sm bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 flex flex-col items-center">
        {/* QR Code Canvas */}
        <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-200/70 flex items-center justify-center">
          <QRCodeSVG
            value={votingUrl}
            size={size}
            level="M"
            includeMargin={false}
            fgColor="#1E1B4B"
            bgColor="#FFFFFF"
          />
        </div>

        {showDetails && (
          <div className="mt-3.5 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Join Code
            </span>
            <span className="text-2xl font-mono font-extrabold text-indigo-600 tracking-wider mt-0.5">
              {joinCode}
            </span>
          </div>
        )}

        {showDetails && (
          <div className="w-full mt-4 pt-3.5 border-t border-slate-200/80 flex flex-col gap-2">
            {/* Join URL with copy button securely contained inside */}
            <div className="w-full flex items-center gap-2 p-1 pl-2.5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <span className="text-slate-600 truncate font-mono text-[11px] flex-1 select-all min-w-0">
                {votingUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 font-semibold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct link for test voting */}
            <div className="w-full flex items-center justify-between text-xs text-slate-500 px-1 pt-0.5">
              <span className="text-[11px] text-slate-400">Scan with phone camera</span>
              <a
                href={votingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-[11px] transition-colors"
              >
                <span>Test vote</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
