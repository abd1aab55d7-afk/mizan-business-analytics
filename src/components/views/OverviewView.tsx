import React from 'react';
import { useApp } from '../../context/AppContext';
import { KpiCard } from '../kpi/KpiCard';
import { TrendAreaChart } from '../charts/TrendAreaChart';
import { DonutChart } from '../charts/DonutChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import {
  calculateTimeSeries,
  calculateCategoryBreakdown,
  calculateProductPerformance,
  formatCurrency,
} from '../../engine/calculations';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Percent,
  Users,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    overviewMetrics,
    filteredTransactions,
    previousPeriodTransactions,
    isDemoData,
    currency,
    language,
    setActiveTab,
    alerts,
    setIsAlertsDrawerOpen,
  } = useApp();

  const timeSeriesData = React.useMemo(() => {
    return calculateTimeSeries(filteredTransactions);
  }, [filteredTransactions]);

  const categoryBreakdown = React.useMemo(() => {
    return calculateCategoryBreakdown(filteredTransactions);
  }, [filteredTransactions]);

  const topProducts = React.useMemo(() => {
    return calculateProductPerformance(filteredTransactions, previousPeriodTransactions);
  }, [filteredTransactions, previousPeriodTransactions]);

  return (
    <div className="space-y-6">
      {/* Synthetic Demo Data Banner */}
      {isDemoData && (
        <div className="demo-banner">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-700 flex-shrink-0" />
            <div>
              <span className="font-bold">
                {language === 'ar' ? 'وضع البيانات التجريبية (DEMO DATA): ' : 'DEMO DATA MODE: '}
              </span>
              <span>
                {language === 'ar'
                  ? 'يتم عرض بيانات مصطنعة لموزع مصري افتراضي (شركة الأمل للتوزيع) لاختبار الحسابات والمؤشرات.'
                  : 'Displaying realistic synthetic data for an Egyptian distributor to demonstrate audited metrics.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('import')}
            >
              <FileSpreadsheet size={14} />
              <span>{language === 'ar' ? 'استيراد ملفك الخاص (CSV/Excel)' : 'Upload your data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Alerts Ticker if any critical alert exists */}
      {alerts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
            <span className="text-xs font-bold text-slate-800 flex-shrink-0">
              {language === 'ar' ? 'تنبيه إداري حديث:' : 'Latest Alert:'}
            </span>
            <span className="text-xs text-slate-600 truncate">
              {language === 'ar' ? alerts[0].titleAr : alerts[0].titleEn} —{' '}
              {language === 'ar' ? alerts[0].evidenceAr : alerts[0].evidenceEn}
            </span>
          </div>

          <button
            type="button"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex-shrink-0 flex items-center gap-1"
            onClick={() => setIsAlertsDrawerOpen(true)}
          >
            <span>{language === 'ar' ? 'عرض كافة التنبيهات' : 'View all alerts'}</span>
            <ArrowRight size={13} className={language === 'ar' ? 'transform rotate-180' : ''} />
          </button>
        </div>
      )}

      {/* 6 Core Executive KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <div className="kpi-grid">
          <KpiCard
            metric={overviewMetrics.totalNetRevenue}
            icon={<DollarSign size={18} />}
            lang={language}
          />
          <KpiCard
            metric={overviewMetrics.orderCount}
            icon={<ShoppingCart size={18} />}
            lang={language}
          />
          <KpiCard
            metric={overviewMetrics.averageOrderValue}
            icon={<TrendingUp size={18} />}
            lang={language}
          />
          <KpiCard
            metric={overviewMetrics.grossProfit}
            icon={<Percent size={18} />}
            lang={language}
          />
          <KpiCard
            metric={overviewMetrics.grossProfitMargin}
            icon={<Percent size={18} />}
            lang={language}
          />
          <KpiCard
            metric={overviewMetrics.activeCustomerCount}
            icon={<Users size={18} />}
            lang={language}
          />
        </div>
      </section>

      {/* Charts Row: Trend Line + Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="chart-card lg:col-span-2">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <h3 className="chart-title">
                {language === 'ar' ? 'مسار الإيرادات وصافي المبيعات' : 'Revenue Trend Over Time'}
              </h3>
              <p className="chart-desc">
                {language === 'ar'
                  ? 'تطور صافي المبيعات اليومية خلال الفترة المحددة'
                  : 'Daily net sales evolution over selected period'}
              </p>
            </div>
            <div className="chart-legend">
              <span className="flex items-center">
                <span className="legend-dot bg-teal-700" />
                {language === 'ar' ? 'صافي المبيعات' : 'Net Sales'}
              </span>
            </div>
          </div>

          <TrendAreaChart
            data={timeSeriesData}
            currency={currency}
            lang={language}
            height={260}
          />
        </div>

        {/* Category Share Donut (1 col) */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <h3 className="chart-title">
                {language === 'ar' ? 'توزيع المبيعات حسب التصنيف' : 'Sales by Category'}
              </h3>
              <p className="chart-desc">
                {language === 'ar' ? 'الحصة النسبية لكل قطاع سلعي' : 'Relative share per product line'}
              </p>
            </div>
          </div>

          <DonutChart
            data={categoryBreakdown.map((c) => ({
              label: c.category,
              value: c.revenue,
              sharePercent: c.sharePercent,
            }))}
            currency={currency}
            lang={language}
            size={180}
          />
        </div>
      </div>

      {/* Secondary Row: Top Products Ranking + Recent Transactions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <h3 className="chart-title">
                {language === 'ar' ? 'الأصناف الأعلى إيراداً' : 'Top Performing Products'}
              </h3>
              <p className="chart-desc">
                {language === 'ar' ? 'ترتيب المنتجات بحسب صافي الدخل' : 'Ranked by net revenue'}
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-teal-700 hover:underline"
              onClick={() => setActiveTab('products')}
            >
              {language === 'ar' ? 'التفاصيل ←' : 'Details →'}
            </button>
          </div>

          <HorizontalBarChart
            items={topProducts.slice(0, 5).map((p) => ({
              id: p.productId,
              label: p.productName,
              subLabel: p.category,
              value: p.netRevenue,
              percentage: p.revenueSharePercent,
            }))}
            currency={currency}
            lang={language}
            maxItems={5}
          />
        </div>

        {/* Recent Invoices Table (2 cols) */}
        <div className="chart-card lg:col-span-2">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <h3 className="chart-title">
                {language === 'ar' ? 'أحدث حركات المبيعات المسجلة' : 'Recent Sales Records'}
              </h3>
              <p className="chart-desc">
                {language === 'ar'
                  ? 'عرض أحدث السجلات المحملة في قاعدة البيانات'
                  : 'Latest transactions in the active dataset'}
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-teal-700 hover:underline"
              onClick={() => setActiveTab('sales')}
            >
              {language === 'ar' ? 'كافة المعاملات ←' : 'All transactions →'}
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                  <th>{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th>{language === 'ar' ? 'العميل' : 'Customer'}</th>
                  <th>{language === 'ar' ? 'الصنف' : 'Product'}</th>
                  <th>{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                  <th>{language === 'ar' ? 'الصافي' : 'Net Total'}</th>
                  <th>{language === 'ar' ? 'المنطقة' : 'Region'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id}>
                    <td className="font-mono font-bold text-teal-800 text-xs">
                      {tx.orderId}
                    </td>
                    <td className="text-slate-500 text-xs">{tx.orderDate}</td>
                    <td className="font-medium text-slate-800">{tx.customerName}</td>
                    <td className="text-slate-700 truncate max-w-[180px]" title={tx.productName}>
                      {tx.productName}
                    </td>
                    <td className="font-semibold text-slate-700">{tx.quantity}</td>
                    <td className="font-extrabold text-slate-900">
                      {formatCurrency(tx.netRevenue, currency, language)}
                    </td>
                    <td>
                      <span className="badge badge-neutral">{tx.region}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
