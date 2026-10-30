import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Currency, Language } from '../../types/data';
import {
  Settings,
  Globe,
  DollarSign,
  Shield,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Server,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    resetToDemoData,
    clearAllData,
    isDemoData,
  } = useApp();

  const [declineThreshold, setDeclineThreshold] = useState<number>(10);
  const [concentrationThreshold, setConcentrationThreshold] = useState<number>(20);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSavePreferences = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {savedMessage && (
        <div className="alert-box success">
          <CheckCircle size={18} className="text-emerald-700 flex-shrink-0" />
          <span className="text-xs font-bold text-emerald-900">
            {language === 'ar'
              ? 'تم حفظ إعدادات النظام وتفضيلات لوحة التحكم بنجاح.'
              : 'System preferences saved successfully.'}
          </span>
        </div>
      )}

      {/* Localization & Currency Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Globe size={18} className="text-teal-700" />
          <h3 className="font-bold text-slate-800 text-sm">
            {language === 'ar' ? 'اللغة والعملة وتنسيق الأرقام' : 'Language, Currency & Localization'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language Switch */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {language === 'ar' ? 'لغة الواجهة (Interface Language)' : 'Interface Language'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  language === 'ar'
                    ? 'border-teal-700 bg-teal-50 text-teal-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setLanguage('ar')}
              >
                العربية (افتراضي - RTL)
              </button>
              <button
                type="button"
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'border-teal-700 bg-teal-50 text-teal-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setLanguage('en')}
              >
                English (LTR)
              </button>
            </div>
          </div>

          {/* Currency Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {language === 'ar' ? 'العملة الافتراضية للتقارير' : 'Default Currency'}
            </label>
            <select
              className="select w-full text-xs"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              <option value="EGP">{language === 'ar' ? 'الجنيه المصري (ج.م / EGP)' : 'Egyptian Pound (EGP)'}</option>
              <option value="SAR">{language === 'ar' ? 'الريال السعودي (ر.س / SAR)' : 'Saudi Riyal (SAR)'}</option>
              <option value="USD">{language === 'ar' ? 'الدولار الأمريكي ($ / USD)' : 'US Dollar (USD)'}</option>
              <option value="EUR">{language === 'ar' ? 'اليورو (€ / EUR)' : 'Euro (EUR)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Thresholds Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Sliders size={18} className="text-teal-700" />
          <h3 className="font-bold text-slate-800 text-sm">
            {language === 'ar' ? 'حدود حساسية التنبيهات الإدارية' : 'Alert Trigger Thresholds'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar'
                ? `نسبة تراجع المبيعات لإطلاق تحذير (${declineThreshold}%)`
                : `Sales decline trigger threshold (${declineThreshold}%)`}
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={declineThreshold}
              onChange={(e) => setDeclineThreshold(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>5% (حساس جداً)</span>
              <span>30% (تراجع قاسي)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar'
                ? `نسبة تركيز العميل لإطلاق تحذير مخاطر (${concentrationThreshold}%)`
                : `Customer concentration trigger (${concentrationThreshold}%)`}
            </label>
            <input
              type="range"
              min="10"
              max="40"
              step="5"
              value={concentrationThreshold}
              onChange={(e) => setConcentrationThreshold(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>10%</span>
              <span>40%</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSavePreferences}
          >
            {language === 'ar' ? 'حفظ التفضيلات' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Privacy & Security Disclosure Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Shield size={18} className="text-teal-700" />
          <h3 className="font-bold text-slate-800 text-sm">
            {language === 'ar' ? 'الخصوصية وأمان بيانات الأعمال' : 'Data Privacy & Security Safeguards'}
          </h3>
        </div>

        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            {language === 'ar'
              ? '• معالجة محلية بالكامل: يتم فك تشفير وتدقيق ملفات المبيعات واستخراج المؤشرات المالية داخل متصفحك مباشرة دون حفظ أي نسخ خارجية لبيانات العملاء.'
              : '• Client-side processing: CSV/Excel data is parsed and audited locally within your browser session.'}
          </p>
          <p>
            {language === 'ar'
              ? '• حماية الخصوصية: لا يتم إرسال أي أرقام فواتير أو أسماء عملاء إلى خدمات ذكاء اصطناعي خارجية دون أمر مباشر منك.'
              : '• Privacy: No individual invoice rows or customer names are transmitted externally without your explicit command.'}
          </p>
          <p>
            {language === 'ar'
              ? '• التخزين المحلي: تُحفظ البيانات المستوردة في الذاكرة التخزينية المحلية للمتصفح (Local Storage) لراحتك عند إعادة فتح المنصة.'
              : '• Local Storage: Imported data persists in your browser’s local storage for continuity.'}
          </p>
        </div>
      </div>

      {/* Danger Zone / Data Management */}
      <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
          <AlertTriangle size={18} />
          <span>{language === 'ar' ? 'إدارة البيانات وإعادة الضبط' : 'Data Management & Reset'}</span>
        </div>

        <p className="text-xs text-slate-600">
          {language === 'ar'
            ? 'يمكنك مسح البيانات المحفوظة محلياً أو العودة إلى مجموعة البيانات التجريبية المصطنعة في أي وقت.'
            : 'Clear local records or switch back to the realistic synthetic distributor demo dataset.'}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={resetToDemoData}
          >
            <RotateCcw size={14} />
            <span>{language === 'ar' ? 'إعادة ضبط البيانات التجريبية (DEMO)' : 'Restore Demo Data'}</span>
          </button>

          <button
            type="button"
            className="btn btn-sm bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => {
              if (
                confirm(
                  language === 'ar'
                    ? 'هل أنت متأكد من مسح كافة سجلات المبيعات والمخزون المحفوظة في المتصفح؟'
                    : 'Are you sure you want to clear all locally stored data?'
                )
              ) {
                clearAllData();
              }
            }}
          >
            <Trash2 size={14} />
            <span>{language === 'ar' ? 'مسح كافة البيانات المحلية' : 'Clear All Local Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
