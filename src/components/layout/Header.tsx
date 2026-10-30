import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Bell,
  RefreshCw,
  Search,
  Globe,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    language,
    setLanguage,
    dateFilter,
    setDateFilter,
    searchQuery,
    setSearchQuery,
    alerts,
    setIsAlertsDrawerOpen,
    setIsMobileNavOpen,
    refreshData,
  } = useApp();

  const titles: Record<string, { ar: string; en: string; subtitleAr: string; subtitleEn: string }> = {
    overview: {
      ar: 'لوحة التحكم التنفيذية',
      en: 'Executive Dashboard',
      subtitleAr: 'مؤشرات الأداء الرئيسية والملخص المالي',
      subtitleEn: 'Key performance indicators & financial summary',
    },
    sales: {
      ar: 'تحليلات المبيعات والإيرادات',
      en: 'Sales & Revenue Analytics',
      subtitleAr: 'تحليل الاتجاهات الزمنية، التصنيفات، والمناطق الجغرافية',
      subtitleEn: 'Time trends, categories & regional performance',
    },
    products: {
      ar: 'تحليل أداء المنتجات والأصناف',
      en: 'Product Performance',
      subtitleAr: 'الأصناف الأكثر مبيعاً، المنتجات الراكدة، وهوامش الربحية',
      subtitleEn: 'Top sellers, slow movers, and gross margin breakdown',
    },
    customers: {
      ar: 'تحليل العملاء والتركيز البيعي',
      en: 'Customer Analytics',
      subtitleAr: 'سلوك الشراء، تركيز الإيرادات (Pareto)، ومخاطر فقدان العملاء',
      subtitleEn: 'Purchase frequency, Pareto concentration, and retention',
    },
    inventory: {
      ar: 'إدارة المخزون والمستودعات',
      en: 'Inventory & Warehouse',
      subtitleAr: 'الأرصدة الحالية، تنبيهات إعادة الطلب، وتقييم البضاعة',
      subtitleEn: 'Stock levels, reorder warnings, and valuation',
    },
    import: {
      ar: 'مركز استيراد ومعالجة البيانات',
      en: 'Data Import Center',
      subtitleAr: 'رفع ملفات CSV وإكسل، مطابقة الأعمدة، والتدقيق المحاسبي',
      subtitleEn: 'Upload CSV/Excel, map columns, and audit records',
    },
    reports: {
      ar: 'التقارير التنفيذية والطباعة',
      en: 'Executive Reports',
      subtitleAr: 'تصدير التقارير الإدارية، حفظ PDF، واستخراج ملفات CSV',
      subtitleEn: 'Management reports, print to PDF, and export CSV',
    },
    analyst: {
      ar: 'المحلل الذكي للأعمال (AI Business Analyst)',
      en: 'AI Business Analyst',
      subtitleAr: 'إجابات ذكية باللغة العربية بالاستناد للأرقام الدقيقة',
      subtitleEn: 'Intelligent answers in Arabic grounded in audited metrics',
    },
    settings: {
      ar: 'الإعدادات والخصوصية',
      en: 'Settings & Privacy',
      subtitleAr: 'العملة الافتراضية، حدود التنبيهات، وحذف البيانات المحلية',
      subtitleEn: 'Currency, alert thresholds, and local data control',
    },
  };

  const currentMeta = titles[activeTab] || titles.overview;

  return (
    <header className="app-header">
      {/* Left side: Hamburger + Title */}
      <div className="header-left">
        <button
          type="button"
          className="md:hidden btn-icon"
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-wrap">
          <h1 className="header-title">
            {language === 'ar' ? currentMeta.ar : currentMeta.en}
          </h1>
          <span className="header-subtitle hidden sm:inline">
            {language === 'ar' ? currentMeta.subtitleAr : currentMeta.subtitleEn}
          </span>
        </div>
      </div>

      {/* Right side: Date filter, search, language, alerts, refresh */}
      <div className="header-right">
        {/* Date Filter Dropdown */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
          <Calendar size={14} className="text-slate-400" />
          <select
            className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            value={dateFilter.preset}
            onChange={(e) =>
              setDateFilter({
                ...dateFilter,
                preset: e.target.value as any,
              })
            }
          >
            <option value="thisQuarter">
              {language === 'ar' ? 'الربع الحالي (أكتوبر 2026)' : 'Current Quarter (Oct 2026)'}
            </option>
            <option value="last30">
              {language === 'ar' ? 'آخر 30 يوماً' : 'Last 30 Days'}
            </option>
            <option value="last7">
              {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}
            </option>
            <option value="today">
              {language === 'ar' ? 'اليوم الحالي' : 'Today'}
            </option>
            <option value="all">
              {language === 'ar' ? 'كامل البيانات' : 'All Time'}
            </option>
          </select>
        </div>

        {/* Search input (when on relevant tabs) */}
        <div className="relative hidden xl:block w-52">
          <Search
            size={14}
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${
              language === 'ar' ? 'right-2.5' : 'left-2.5'
            }`}
          />
          <input
            type="text"
            className={`w-full text-xs py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-700 ${
              language === 'ar' ? 'pr-8 pl-3' : 'pl-8 pr-3'
            }`}
            placeholder={language === 'ar' ? 'بحث سريع...' : 'Quick search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Refresh button */}
        <button
          type="button"
          className="btn-icon"
          title={language === 'ar' ? 'تحديث الحسابات' : 'Refresh calculations'}
          onClick={refreshData}
          aria-label="Refresh data"
        >
          <RefreshCw size={16} />
        </button>

        {/* Alerts Bell */}
        <button
          type="button"
          className="btn-icon relative"
          title={language === 'ar' ? 'التنبيهات الإدارية' : 'Business alerts'}
          onClick={() => setIsAlertsDrawerOpen(true)}
          aria-label="Alerts"
        >
          <Bell size={17} />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-pulse">
              {alerts.length}
            </span>
          )}
        </button>

        {/* Language Switcher */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
        >
          <Globe size={14} />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>
    </header>
  );
};
