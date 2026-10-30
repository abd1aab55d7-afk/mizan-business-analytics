import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateCategoryBreakdown,
  calculateProductPerformance,
  calculateCustomerPerformance,
  formatCurrency,
} from '../../engine/calculations';
import {
  Printer,
  Download,
  FileText,
  AlertTriangle,
  Building,
  CheckCircle,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    filteredTransactions,
    previousPeriodTransactions,
    overviewMetrics,
    alerts,
    currency,
    language,
    isDemoData,
    dateFilter,
  } = useApp();

  const topProducts = React.useMemo(() => {
    return calculateProductPerformance(filteredTransactions, previousPeriodTransactions).slice(0, 5);
  }, [filteredTransactions, previousPeriodTransactions]);

  const topCustomers = React.useMemo(() => {
    return calculateCustomerPerformance(filteredTransactions).slice(0, 5);
  }, [filteredTransactions]);

  const categoryBreakdown = React.useMemo(() => {
    return calculateCategoryBreakdown(filteredTransactions);
  }, [filteredTransactions]);

  // Export Filtered Transactions to CSV
  const exportRawCsv = () => {
    if (filteredTransactions.length === 0) return;
    const headers = [
      'Order ID',
      'Order Date',
      'Customer ID',
      'Customer Name',
      'Product ID',
      'Product Name',
      'Category',
      'Quantity',
      'Unit Price',
      'Unit Cost',
      'Discount',
      'Return Amount',
      'Net Revenue',
      'Gross Profit',
      'Region',
      'Sales Rep',
    ];

    const rows = filteredTransactions.map((t) => [
      t.orderId,
      t.orderDate,
      t.customerId,
      `"${t.customerName.replace(/"/g, '""')}"`,
      t.productId,
      `"${t.productName.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      t.quantity,
      t.unitPrice,
      t.unitCost ?? '',
      t.discount,
      t.returnAmount,
      t.netRevenue,
      t.grossProfit ?? '',
      `"${t.region.replace(/"/g, '""')}"`,
      `"${(t.salesRep || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `executive_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (hidden on print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            {language === 'ar' ? 'التقرير الإداري التنفيذي' : 'Executive Management Report'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'تقرير موثق بأحدث المؤشرات المالية والحسابية والاتجاهات'
              : 'Audited financial metrics and performance summary ready to print or export'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportRawCsv}
          >
            <Download size={14} />
            <span>{language === 'ar' ? 'تصدير جدول المعاملات (CSV)' : 'Export CSV'}</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handlePrint}
          >
            <Printer size={14} />
            <span>{language === 'ar' ? 'طباعة / حفظ كـ PDF' : 'Print / Save as PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Surface */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8 max-w-4xl mx-auto printable-report">
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-teal-700" />
              <h2 className="text-xl font-extrabold text-slate-900">Business Insight AI</h2>
            </div>
            <p className="text-xs text-teal-800 font-bold">
              {language === 'ar'
                ? 'تقرير الأداء الإداري والتحليلي للموزعين'
                : 'Executive Distributor Analytics Report'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? 'المنشأة: شركة الأمل للتوزيع والتوريدات (القاهرة)'
                : 'Entity: Al-Amal Distribution Co. (Cairo Hub)'}
            </p>
          </div>

          <div className="text-end text-xs text-slate-500 space-y-1">
            <div>
              <span className="font-semibold text-slate-700">
                {language === 'ar' ? 'فترة التقرير: ' : 'Reporting Window: '}
              </span>
              <span>{dateFilter.preset}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">
                {language === 'ar' ? 'تاريخ الاستخراج: ' : 'Generated On: '}
              </span>
              <span>{new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
            </div>
            {isDemoData && (
              <span className="badge badge-warning text-[10px]">
                {language === 'ar' ? 'بيانات تجريبية مصطنعة (DEMO)' : 'SYNTHETIC DEMO DATA'}
              </span>
            )}
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3">
            {language === 'ar' ? '1. مؤشرات الأداء الرئيسية (KPIs)' : '1. Key Financial KPIs'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block">
                {language === 'ar' ? 'صافي المبيعات' : 'Net Sales Revenue'}
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {overviewMetrics.totalNetRevenue.formattedValue}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block">
                {language === 'ar' ? 'عدد الطلبات' : 'Order Count'}
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {overviewMetrics.orderCount.formattedValue}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block">
                {language === 'ar' ? 'متوسط قيمة الطلب' : 'Average Order Value'}
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {overviewMetrics.averageOrderValue.formattedValue}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block">
                {language === 'ar' ? 'إجمالي الربح (COGS)' : 'Gross Profit'}
              </span>
              <span className="text-lg font-extrabold text-emerald-800">
                {overviewMetrics.grossProfit.formattedValue}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block">
                {language === 'ar' ? 'هامش الربح الإجمالي' : 'Gross Margin'}
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {overviewMetrics.grossProfitMargin.formattedValue}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block">
                {language === 'ar' ? 'العملاء النشطون' : 'Active Accounts'}
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {overviewMetrics.activeCustomerCount.formattedValue}
              </span>
            </div>
          </div>
        </div>

        {/* Top 5 Products Table */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3">
            {language === 'ar' ? '2. الأصناف الخمسة الأكثر تحقيقاً للإيرادات' : '2. Top 5 Revenue SKUs'}
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{language === 'ar' ? 'كود الصنف' : 'SKU'}</th>
                  <th>{language === 'ar' ? 'اسم الصنف' : 'Product Name'}</th>
                  <th>{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                  <th>{language === 'ar' ? 'صافي الإيراد' : 'Net Revenue'}</th>
                  <th>{language === 'ar' ? 'المساهمة %' : 'Share %'}</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.productId}>
                    <td className="font-mono text-xs">{p.productId}</td>
                    <td className="font-bold">{p.productName}</td>
                    <td>{p.unitsSold}</td>
                    <td className="font-extrabold text-teal-800">
                      {formatCurrency(p.netRevenue, currency, language)}
                    </td>
                    <td>{p.revenueSharePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Concentration Top 5 */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3">
            {language === 'ar' ? '3. كبار العملاء ومؤشر التركيز' : '3. Key Accounts & Concentration'}
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{language === 'ar' ? 'العميل' : 'Customer'}</th>
                  <th>{language === 'ar' ? 'المنطقة' : 'Region'}</th>
                  <th>{language === 'ar' ? 'الطلبيات' : 'Orders'}</th>
                  <th>{language === 'ar' ? 'إجمالي المشتريات' : 'Total Revenue'}</th>
                  <th>{language === 'ar' ? 'نسبة التركيز' : 'Share'}</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c) => (
                  <tr key={c.customerId}>
                    <td className="font-bold">{c.customerName}</td>
                    <td>{c.region}</td>
                    <td>{c.orderCount}</td>
                    <td className="font-extrabold text-teal-800">
                      {formatCurrency(c.totalRevenue, currency, language)}
                    </td>
                    <td>{c.revenueSharePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evidence-Based Recommendations */}
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3">
            {language === 'ar' ? '4. التنبيهات الإدارية والتوصيات المستندة للأرقام' : '4. Audited Recommendations'}
          </h3>
          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-800 block">
                  • {language === 'ar' ? alert.titleAr : alert.titleEn}
                </span>
                <p className="text-slate-600">
                  <span className="font-semibold">{language === 'ar' ? 'الدليل: ' : 'Evidence: '}</span>
                  {language === 'ar' ? alert.evidenceAr : alert.evidenceEn}
                </p>
                <p className="text-teal-800 font-semibold">
                  <span className="font-bold">{language === 'ar' ? 'الإجراء المقترح: ' : 'Action: '}</span>
                  {language === 'ar' ? alert.recommendedActionAr : alert.recommendedActionEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Assumptions Footnote */}
        <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-400 space-y-1 leading-relaxed">
          <p className="font-bold text-slate-600">
            {language === 'ar' ? 'فرضيات ومعايير الحساب المحاسبي:' : 'Accounting & Calculation Assumptions:'}
          </p>
          <p>
            {language === 'ar'
              ? '1. صافي المبيعات = (الكمية × سعر البيع) - الخصم الممنوح - المرتجعات. 2. عدد الطلبات محسوب بناءً على المعرفات الفريدة للفواتير دون تكرار سطور الأصناف. 3. إجمالي الربح يحتسب فقط في حال توفر سعر التكلفة الفعلي للوحدة في قاعدة البيانات.'
              : '1. Net revenue = Gross - discounts - returns. 2. Order count reflects distinct invoice numbers. 3. Gross profit is computed exclusively when reliable unit cost data is verified.'}
          </p>
        </div>
      </div>
    </div>
  );
};
