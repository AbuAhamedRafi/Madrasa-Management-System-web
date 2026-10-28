import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, Ban, Send } from 'lucide-react';

interface Props {
  status: string;
  onUpdateStatus: (status: 'ACTIVE' | 'DISABLED', reason?: string) => Promise<void>;
  onReissueInvitation: () => Promise<void>;
  isSubmitting: boolean;
}

export const UserStatusCard: React.FC<Props> = ({
  status,
  onUpdateStatus,
  onReissueInvitation,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [reason, setReason] = useState('');

  const getStatusBadge = () => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" />
            Active
          </span>
        );
      case 'INVITED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Pending Activation (Invited)
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <Ban className="w-3.5 h-3.5" />
            Disabled
          </span>
        );
      default:
        return null;
    }
  };

  const handleDisableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateStatus('DISABLED', reason);
    setShowDisableForm(false);
    setReason('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-1">{t('status_management')}</h3>
          <p className="text-xs text-slate-500">Manage account lifecycle state, access permissions, and activation tokens.</p>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-3 items-center">
        {/* Reissue Invitation Link */}
        <button
          type="button"
          onClick={onReissueInvitation}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-[#137C73]" />
          {t('reissue_invitation')}
        </button>

        {/* Status transitions */}
        {status === 'ACTIVE' && !showDisableForm && (
          <button
            type="button"
            onClick={() => setShowDisableForm(true)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            {t('disable_user')}
          </button>
        )}

        {status === 'DISABLED' && (
          <button
            type="button"
            onClick={() => onUpdateStatus('ACTIVE')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {t('activate_user')}
          </button>
        )}
      </div>

      {/* Disable Reason Form */}
      {showDisableForm && (
        <form onSubmit={handleDisableSubmit} className="mt-4 p-4 rounded-xl bg-rose-50/50 border border-rose-200/60 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 font-medium">
              Disabling this account immediately revokes all active sessions. An audit log entry will record your username and reason.
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t('reason_label')}</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('reason_placeholder')}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDisableForm(false)}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50"
            >
              Confirm Disable
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
