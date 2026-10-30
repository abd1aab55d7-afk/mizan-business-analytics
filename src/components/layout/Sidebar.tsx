import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types/data';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
  Boxes,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Settings,
  Building2,
  Database,
  X,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    language,
    isDemoData,
    allTransactions,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useApp();

  const navItems: { id: ActiveTab; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      labelAr: 'نظرة عامة',
      labelEn: 'Overview',
      icon: <LayoutDashboard size={19} />,
    },
    {
      id: 'sales',
      labelAr: 'تحليلات المبيعات',
      labelEn: 'Sales Analytics',
      icon: <TrendingUp size={19} />,
    },
    {
      id: 'products',
      labelAr: 'المنتجات والأصناف',
      labelEn: 'Products',
      icon: <Package size={19} />,
    },
    {
      id: 'customers',
      labelAr: 'تحليل العملاء',
      labelEn: 'Customers',
      icon: <Users size={19} />,
    },
    {
      id: 'inventory',
      labelAr: 'المخزون والمستودعات',
      labelEn: 'Inventory',
      icon: <Boxes size={19} />,
    },
    {
      id: 'import',
      labelAr: 'مركز استيراد البيانات',
      labelEn: 'Data Import',
      icon: <FileSpreadsheet size={19} />,
    },
    {
      id: 'reports',
      labelAr: 'التقارير التنفيذية',
      labelEn: 'Reports',
      icon: <FileText size={19} />,
    },
    {
      id: 'analyst',
      labelAr: 'المحلل الذكي (AI)',
      labelEn: 'AI Analyst',
      icon: <Sparkles size={19} className="text-emerald-500" />,
    },
    {
      id: 'settings',
      labelAr: 'الإعدادات والخصوصية',
      labelEn: 'Settings',
      icon: <Settings size={19} />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isMobileNavOpen ? 'open' : ''}`}>
        {/* Header / Brand */}
        <div className="sidebar-header justify-between">
          <div className="flex items-center gap-2.5">
            <div className="sidebar-logo-icon">
              <Sparkles size={20} />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Business Insight AI</span>
              <span className="sidebar-brand-tagline">
                {language === 'ar' ? 'تحليلات ذكية للموزعين' : 'Distributor Analytics'}
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileNavOpen(false);
                }}
              >
                {item.icon}
                <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info: Workspace, data source status, version */}
        <div className="sidebar-footer">
          <div className="workspace-badge">
            <Building2 size={18} className="text-teal-700 flex-shrink-0" />
            <div className="workspace-info">
              <span className="workspace-name" title="شركة الأمل للتوزيع والتوريدات">
                {language === 'ar' ? 'شركة الأمل للتوزيع' : 'Al-Amal Distribution Co.'}
              </span>
              <span className="workspace-sub">
                {language === 'ar' ? 'القاهرة الكبرى والإسكندرية' : 'Cairo & Alex Hub'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
            <div className="flex items-center gap-1.5">
              <Database size={13} className={isDemoData ? 'text-amber-500' : 'text-emerald-500'} />
              <span>
                {isDemoData
                  ? language === 'ar'
                    ? 'بيانات تجريبية'
                    : 'Demo Data'
                  : language === 'ar'
                  ? `بيانات حية (${allTransactions.length} سطر)`
                  : `Live (${allTransactions.length} rows)`}
              </span>
            </div>
            <span className="font-mono text-slate-400">v1.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
