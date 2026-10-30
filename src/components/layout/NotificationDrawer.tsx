import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Info,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    alerts,
    dismissAlert,
    isAlertsDrawerOpen,
    setIsAlertsDrawerOpen,
    language,
    setActiveTab,
  } = useApp();

  if (!isAlertsDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAlertsDrawerOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-y-0 ${
          language === 'ar' ? 'left-0' : 'right-0'
        } max-w-md w-full bg-white shadow-2xl flex flex-col z-50`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-teal-700" />
            <h2 className="font-bold text-slate-800 text-sm">
              {language === 'ar' ? 'تنبيهات وتوصيات الأعمال' : 'Business Alerts & Recommendations'}
            </h2>
            <span className="badge badge-primary">{alerts.length}</span>
          </div>

          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
            onClick={() => setIsAlertsDrawerOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerts list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <CheckCircle size={36} className="text-emerald-500" />
              <p className="font-semibold text-sm">
                {language === 'ar'
                  ? 'لا توجد تنبيهات نشطة حالياً'
                  : 'No active alerts at this time'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'جميع المؤشرات تقع ضمن الحدود المقبولة'
                  : 'All indicators are within acceptable ranges'}
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isCrit = alert.type === 'critical';
              const isWarn = alert.type === 'warning';
              const isOpp = alert.type === 'opportunity';

              return (
                <div
                  key={alert.id}
                  className={`border rounded-xl p-3.5 flex flex-col gap-2.5 transition-all shadow-xs ${
                    isCrit
                      ? 'bg-red-50/60 border-red-200'
                      : isWarn
                      ? 'bg-amber-50/60 border-amber-200'
                      : isOpp
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-sky-50/60 border-sky-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isCrit ? (
                        <AlertOctagon size={16} className="text-red-600 flex-shrink-0" />
                      ) : isWarn ? (
                        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                      ) : isOpp ? (
                        <TrendingUp size={16} className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Info size={16} className="text-sky-600 flex-shrink-0" />
                      )}
                      <h4
                        className={`font-bold text-xs ${
                          isCrit
                            ? 'text-red-900'
                            : isWarn
                            ? 'text-amber-900'
                            : isOpp
                            ? 'text-emerald-900'
                            : 'text-sky-900'
                        }`}
                      >
                        {language === 'ar' ? alert.titleAr : alert.titleEn}
                      </h4>
                    </div>

                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                      onClick={() => dismissAlert(alert.id)}
                      title={language === 'ar' ? 'تجاهل التنبيه' : 'Dismiss alert'}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Evidence */}
                  <div className="text-xs text-slate-700 bg-white/70 p-2 rounded-md border border-slate-200/50">
                    <span className="font-semibold text-slate-500 block text-[10px] mb-0.5">
                      {language === 'ar' ? 'الدليل الحسابي:' : 'Calculated Evidence:'}
                    </span>
                    {language === 'ar' ? alert.evidenceAr : alert.evidenceEn}
                  </div>

                  {/* Recommended Action */}
                  <div className="flex items-start gap-1.5 text-xs text-slate-800">
                    <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">
                        {language === 'ar' ? 'الإجراء المقترح: ' : 'Recommended: '}
                      </span>
                      {language === 'ar'
                        ? alert.recommendedActionAr
                        : alert.recommendedActionEn}
                    </div>
                  </div>

                  {/* Reason footnote */}
                  <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-200/50 pt-1.5 mt-0.5">
                    <span>
                      {language === 'ar' ? alert.periodAr : alert.periodEn}
                    </span>
                    <button
                      type="button"
                      className="text-teal-700 hover:underline font-semibold"
                      onClick={() => {
                        setIsAlertsDrawerOpen(false);
                        setActiveTab('analyst');
                      }}
                    >
                      {language === 'ar' ? 'استشر المحلل الذكي ←' : 'Consult AI Analyst →'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            {language === 'ar'
              ? 'تعتمد التنبيهات على قواعد إحصائية مثبتة ومقارنات الفترات السابقة'
              : 'Alerts are generated using verified statistical thresholds'}
          </p>
        </div>
      </div>
    </div>
  );
};
