import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  User,
  FileSpreadsheet,
} from 'lucide-react';
import { promotionsApi } from '../../services/promotionsApi';
import type { PromotionBatch, PromotionEvent } from '../../types/promotions';

export const BatchAuditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('bn') ? 'bn' : 'en';

  const [batch, setBatch] = useState<PromotionBatch | null>(null);
  const [events, setEvents] = useState<PromotionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const batchData = await promotionsApi.getBatch(Number(id));
        setBatch(batchData);
        const eventsData = await promotionsApi.getBatchEvents(Number(id));
        setEvents(eventsData);
      } catch (err) {
        console.error('Failed to load audit history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <Link
            to={`/app/promotions/batches/${id}`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">
                {language === 'bn' ? 'অডিট ও কার্যক্রমের ইতিহাস' : 'Batch Audit & Event Trail'}
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {batch?.batch_number}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn'
                ? 'ব্যাচের প্রতিটি পরিবর্তন ও সম্পাদন প্রক্রিয়ার অপরিবর্তনীয় অডিট লগ'
                : 'Immutable audit trail of all state transitions and operator actions'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {batch && (
            <a
              href={promotionsApi.getExportUrl(batch.id)}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{t('btn_export_csv')}</span>
            </a>
          )}
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>{language === 'bn' ? 'কার্যক্রম টাইমলাইন' : 'Event Timeline'}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-6 h-6 mx-auto mb-2 animate-spin text-teal-600" />
            <span>{language === 'bn' ? 'অডিট ডাটা লোড হচ্ছে...' : 'Loading audit trail...'}</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {language === 'bn' ? 'কোনো অডিট রেকর্ড পাওয়া যায়নি' : 'No audit events recorded yet'}
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-100">
            {events.map((evt) => (
              <div key={evt.id} className="relative flex items-start gap-4 text-xs">
                <div className="w-7 h-7 rounded-full bg-teal-50 border-2 border-teal-600 flex items-center justify-center shrink-0 z-10 text-teal-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{evt.action}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(evt.occurred_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <User className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn' ? 'ব্যবহারকারী: ' : 'Actor: '}
                      <span className="font-semibold text-slate-700">
                        {evt.actor ? evt.actor.name_en || evt.actor.username : `User #${evt.actor_user_id || '-'}`}
                      </span>
                    </span>
                  </div>

                  {evt.after_json && (
                    <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-600 overflow-x-auto">
                      <pre>{JSON.stringify(evt.after_json, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
