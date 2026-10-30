import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendAreaChart } from '../charts/TrendAreaChart';
import { DonutChart } from '../charts/DonutChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import {
  calculateTimeSeries,
  calculateCategoryBreakdown,
  calculateRegionalBreakdown,
  calculateSalesRepBreakdown,
  calculateProductPerformance,
  calculateCustomerPerformance,
  formatCurrency,
  formatPercent,
} from '../../engine/calculations';
import { Filter, RotateCcw } from 'lucide-react';

export const SalesView: React.FC = () => {
  const {
    filteredTransactions,
    previousPeriodTransactions,
    currency,
    language,
  } = useApp();

  // Multi-dimensional filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRep, setSelectedRep] = useState<string>('all');
  const [timeViewMetric, setTimeViewMetric] = useState<'netRevenue' | 'orderCount'>('netRevenue');

  // Available options
  const categories = useMemo(() => {
    const set = new Set<string>();
    filteredTransactions.forEach((t) => t.category && set.add(t.category));
    return Array.from(set);
  }, [filteredTransactions]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    filteredTransactions.forEach((t) => t.region && set.add(t.region));
    return Array.from(set);
  }, [filteredTransactions]);

  const reps = useMemo(() => {
    const set = new Set<string>();
    filteredTransactions.forEach((t) => t.salesRep && set.add(t.salesRep));
    return Array.from(set);
  }, [filteredTransactions]);

  // Filtered dataset according to secondary filters
  const activeData = useMemo(() => {
    return filteredTransactions.filter((t) => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (selectedRegion !== 'all' && t.region !== selectedRegion) return false;
      if (selectedRep !== 'all' && t.salesRep !== selectedRep) return false;
      return true;
    });
  }, [filteredTransactions, selectedCategory, selectedRegion, selectedRep]);

  const timeSeries = useMemo(() => calculateTimeSeries(activeData), [activeData]);
  const categoryBreakdown = useMemo(() => calculateCategoryBreakdown(activeData), [activeData]);
  const regionalBreakdown = useMemo(() => calculateRegionalBreakdown(activeData), [activeData]);
  const salesRepBreakdown = useMemo(() => calculateSalesRepBreakdown(activeData), [activeData]);
  const productPerformance = useMemo(
    () => calculateProductPerformance(activeData, previousPeriodTransactions),
    [activeData, previousPeriodTransactions]
  );
  const customerPerformance = useMemo(
    () => calculateCustomerPerformance(activeData),
    [activeData]
  );

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedRegion('all');
    setSelectedRep('all');
  };

  return (
    <div className="space-y-6">
      {/* Interactive Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-teal-700" />
            <h3 className="font-bold text-slate-800 text-sm">
              {language === 'ar' ? 'تصفية تحليلات المبيعات' : 'Sales Dimensional Filters'}
            </h3>
            <span className="text-xs text-slate-400">
              ({activeData.length} {language === 'ar' ? 'حركة مطابقة' : 'matching records'})
            </span>
          </div>

          {(selectedCategory !== 'all' || selectedRegion !== 'all' || selectedRep !== 'all') && (
            <button
              type="button"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              onClick={resetFilters}
            >
              <RotateCcw size={12} />
              <span>{language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset filters'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              {language === 'ar' ? 'التصنيف السلعي' : 'Category'}
            </label>
            <select
              className="select w-full text-xs"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{language === 'ar' ? 'جميع التصنيفات' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              {language === 'ar' ? 'المحافظة / الإقليم' : 'Region'}
            </label>
            <select
              className="select w-full text-xs"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">{language === 'ar' ? 'جميع المناطق' : 'All Regions'}</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Sales Rep Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              {language === 'ar' ? 'مندوب المبيعات' : 'Sales Representative'}
            </label>
            <select
              className="select w-full text-xs"
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
            >
              <option value="all">{language === 'ar' ? 'كافة المناديب' : 'All Sales Reps'}</option>
              {reps.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Trend Chart with Toggle */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-wrap">
            <h3 className="chart-title">
              {timeViewMetric === 'netRevenue'
                ? language === 'ar'
                  ? 'صافي الإيرادات عبر الزمن'
                  : 'Net Revenue Over Time'
                : language === 'ar'
                ? 'عدد الطلبات عبر الزمن'
                : 'Order Volume Over Time'}
            </h3>
            <p className="chart-desc">
              {language === 'ar'
                ? 'البيانات المفلترة بحسب المعايير المختارة أعلاه'
                : 'Filtered series matching your active dimensional criteria'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                timeViewMetric === 'netRevenue'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setTimeViewMetric('netRevenue')}
            >
              {language === 'ar' ? 'الإيرادات (ج.م)' : 'Revenue'}
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                timeViewMetric === 'orderCount'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setTimeViewMetric('orderCount')}
            >
              {language === 'ar' ? 'عدد الطلبات' : 'Order Count'}
            </button>
          </div>
        </div>

        <TrendAreaChart
          data={
            timeViewMetric === 'netRevenue'
              ? timeSeries
              : timeSeries.map((t) => ({ ...t, netRevenue: t.orderCount }))
          }
          currency={timeViewMetric === 'netRevenue' ? currency : ''}
          lang={language}
          height={270}
        />
      </div>

      {/* Two Columns: Regional Analysis & Sales Reps Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Breakdown Card */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <h3 className="chart-title">
                {language === 'ar' ? 'توزيع المبيعات الجغرافية (المحافظات)' : 'Sales by Region'}
              </h3>
              <p className="chart-desc">
                {language === 'ar'
                  ? 'حجم المبيعات في الأقاليم المصرية المختلفة'
                  : 'Revenue distribution across governorates'}
              </p>
            </div>
          </div>

          <DonutChart
            data={regionalBreakdown.map((r) => ({
              label: r.region,
              value: r.revenue,
              sharePercent: r.sharePercent,
            }))}
            currency={currency}
            lang={language}
            size={180}
          />
        </div>

        {/* Sales Representatives Card */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <h3 className="chart-title">
                {language === 'ar' ? 'أداء مناديب المبيعات والتوزيع' : 'Sales Rep Performance'}
              </h3>
              <p className="chart-desc">
                {language === 'ar'
                  ? 'المبيعات ومتوسط قيمة الفاتورة لكل مندوب'
                  : 'Invoiced totals and average ticket per rep'}
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{language === 'ar' ? 'المندوب' : 'Sales Rep'}</th>
                  <th>{language === 'ar' ? 'إجمالي المبيعات' : 'Revenue'}</th>
                  <th>{language === 'ar' ? 'الطلبات' : 'Orders'}</th>
                  <th>{language === 'ar' ? 'متوسط الفاتورة' : 'Avg Ticket'}</th>
                </tr>
              </thead>
              <tbody>
                {salesRepBreakdown.map((rep) => (
                  <tr key={rep.salesRep}>
                    <td className="font-bold text-slate-800">{rep.salesRep}</td>
                    <td className="font-extrabold text-teal-800">
                      {formatCurrency(rep.revenue, currency, language)}
                    </td>
                    <td className="font-semibold text-slate-600">{rep.orderCount}</td>
                    <td className="text-slate-700">
                      {formatCurrency(rep.avgOrderValue, currency, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product & Customer Rankings comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <h3 className="chart-title">
                {language === 'ar' ? 'المنتجات الأفضل أداءً' : 'Best Performing Products'}
              </h3>
              <p className="chart-desc">
                {language === 'ar' ? 'الأصناف الأعلى دخلاً في الفترة' : 'Top revenue generating SKUs'}
              </p>
            </div>
          </div>
          <HorizontalBarChart
            items={productPerformance.slice(0, 6).map((p) => ({
              id: p.productId,
              label: p.productName,
              subLabel: p.category,
              value: p.netRevenue,
              percentage: p.revenueSharePercent,
            }))}
            currency={currency}
            lang={language}
          />
        </div>

        {/* Top Customers */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title-wrap">
              <h3 className="chart-title">
                {language === 'ar' ? 'كبار العملاء من حيث الإيرادات' : 'Top Revenue Customers'}
              </h3>
              <p className="chart-desc">
                {language === 'ar' ? 'أكبر المتاجر والموزعين شراًء' : 'Highest spend accounts'}
              </p>
            </div>
          </div>
          <HorizontalBarChart
            items={customerPerformance.slice(0, 6).map((c) => ({
              id: c.customerId,
              label: c.customerName,
              subLabel: c.region,
              value: c.totalRevenue,
              percentage: c.revenueSharePercent,
            }))}
            currency={currency}
            lang={language}
          />
        </div>
      </div>
    </div>
  );
};
