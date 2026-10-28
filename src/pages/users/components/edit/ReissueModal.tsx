import React, { useState } from 'react';
import { Copy, Check, X, ShieldAlert } from 'lucide-react';

interface Props {
  activationUrl: string;
  expiresAt: string;
  onClose: () => void;
}

export const ReissueModal: React.FC<Props> = ({ activationUrl, expiresAt, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            New Activation Link Generated
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            A single-use activation link has been generated. Provide this link to the staff member so they can set their password.
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-mono text-slate-800 break-all select-all">
              {activationUrl}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Valid for 30 minutes</span>
            <span>Expires: {new Date(expiresAt).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#137C73] hover:bg-[#0f665e] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Activation Link'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

