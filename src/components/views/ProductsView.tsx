import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateProductPerformance,
  formatCurrency,
  formatPercent,
  hasReliableCostData,
} from '../../engine/calculations';
import { ProductPerformance } from '../../types/data';
import {
  Package,
  TrendingDown,
  Award,
  AlertTriangle,
  Archive,
  Info,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const {
    filteredTransactions,
    previousPeriodTransactions,
    inventory,
    currency,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'top' | 'declining' | 'idle' | 'low_stock'>('all');

  const products = useMemo(() => {
    return calculateProductPerformance(filteredTransactions, previousPeriodTransactions);
  }, [filteredTransactions, previousPeriodTransactions]);

  const hasCost = useMemo(() => hasReliableCostData(filteredTransactions), [filteredTransactions]);

  // Inventory map for current stock
  const inventoryMap = useMemo(() => {
    const map = new Map<string, number>();
    inventory.forEach((item) => {
      map.set(item.productId, item.quantityOnHand);
      map.set(item.productName, item.quantityOnHand);
    });
    return map;
  }, [inventory]);

  // Filter products by tab
  const displayedProducts = useMemo(() => {
    if (activeTab === 'top') {
      return products.filter((p) => p.revenueSharePercent >= 8 || p.status === 'top_seller');
    }
    if (activeTab === 'declining') {
      return products.filter(
        (p) =>
          p.salesTrendPercent !== null &&
          p.salesTrendPercent !== undefined &&
          p.salesTrendPercent <= -15
      );
    }
    if (activeTab === 'idle') {
      return products.filter((p) => p.unitsSold === 0 || p.status === 'zero_sales');
    }
    if (activeTab === 'low_stock') {
      return products.filter((p) => {
        const stock = inventoryMap.get(p.productId) ?? inventoryMap.get(p.productName);
        return stock !== undefined && stock <= 30;
      });
    }
    return products;
  }, [products, activeTab, inventoryMap]);

  return (
    <div className="space-y-6">
      {/* Criteria Info Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={18} className="text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800">
            {language === 'ar' ? 'معايير تصنيف أداء المنتجات: ' : 'Product Analytics Criteria: '}
          </span>
          {language === 'ar'
            ? 'يتم احتساب مساهمة الصنف بنسبة صافي إيراده إلى إجمالي مبيعات الفترة. يُصنف كـ "متراجع" إذا انخفضت مبيعاته بأكثر من 15% مقارنة بالفترة السابقة. لا يتم افتراض الربحية أو الخسارة بدون توافر سعر التكلفة الفعلي.'
            : 'Revenue share is calculated against net sales. Declining items represent >15% drop vs previous period. Profitability is computed solely when verified unit cost is supplied.'}
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          {language === 'ar' ? `كافة الأصناف (${products.length})` : `All SKUs (${products.length})`}
        </button>

        <button
          type="button"
          className={`tab-btn flex items-center gap-1.5 ${activeTab === 'top' ? 'active' : ''}`}
          onClick={() => setActiveTab('top')}
        >
          <Award size={14} className="text-amber-500" />
          <span>{language === 'ar' ? 'الأكثر مبيعاً' : 'Top Sellers'}</span>
        </button>

        <button
          type="button"
          className={`tab-btn flex items-center gap-1.5 ${
            activeTab === 'declining' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('declining')}
        >
          <TrendingDown size={14} className="text-rose-500" />
          <span>{language === 'ar' ? 'مبيعات متراجعة' : 'Declining Sales'}</span>
        </button>

        <button
          type="button"
          className={`tab-btn flex items-center gap-1.5 ${
            activeTab === 'low_stock' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('low_stock')}
        >
          <AlertTriangle size={14} className="text-amber-500" />
          <span>{language === 'ar' ? 'تنبيه انخفاض الرصيد' : 'Low Stock'}</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="table-container shadow-xs">
        <table className="data-table">
          <thead>
            <tr>
              <th>{language === 'ar' ? 'كود الصنف' : 'SKU Code'}</th>
              <th>{language === 'ar' ? 'اسم الصنف' : 'Product Name'}</th>
              <th>{language === 'ar' ? 'التصنيف' : 'Category'}</th>
              <th>{language === 'ar' ? 'الكمية المباعة' : 'Units Sold'}</th>
              <th>{language === 'ar' ? 'صافي المبيعات' : 'Net Revenue'}</th>
              <th>{language === 'ar' ? 'المساهمة' : 'Revenue Share'}</th>
              <th>{language === 'ar' ? 'إجمالي الربح' : 'Gross Profit'}</th>
              <th>{language === 'ar' ? 'الهامش %' : 'Margin %'}</th>
              <th>{language === 'ar' ? 'الاتجاه' : 'Trend'}</th>
              <th>{language === 'ar' ? 'المخزون المتوفر' : 'Stock'}</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-slate-400">
                  {language === 'ar'
                    ? 'لا توجد أصناف تطابق هذا التبويب حالياً'
                    : 'No products match this criterion'}
                </td>
              </tr>
            ) : (
              displayedProducts.map((p) => {
                const stock = inventoryMap.get(p.productId) ?? inventoryMap.get(p.productName);
                const isLowStock = stock !== undefined && stock <= 30;

                return (
                  <tr key={p.productId}>
                    <td className="font-mono text-xs text-slate-500 font-bold">
                      {p.productId}
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{p.productName}</span>
                        {p.orderCount > 0 && (
                          <span className="text-[11px] text-slate-400">
                            {p.orderCount} {language === 'ar' ? 'طلبيات' : 'orders'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{p.category}</span>
                    </td>
                    <td className="font-bold text-slate-800">
                      {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(
                        p.unitsSold
                      )}
                    </td>
                    <td className="font-extrabold text-teal-800">
                      {formatCurrency(p.netRevenue, currency, language)}
                    </td>
                    <td>
                      <span className="font-bold text-slate-700">{p.revenueSharePercent}%</span>
                    </td>
                    <td>
                      {p.grossProfit !== null ? (
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(p.grossProfit, currency, language)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          {language === 'ar' ? 'غير متوفر (بدون تكلفة)' : 'N/A (Missing Cost)'}
                        </span>
                      )}
                    </td>
                    <td>
                      {p.grossProfitMargin !== null ? (
                        <span
                          className={`font-extrabold text-xs px-2 py-0.5 rounded ${
                            p.grossProfitMargin >= 12
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {p.grossProfitMargin}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      {p.salesTrendPercent !== null && p.salesTrendPercent !== undefined ? (
                        <span
                          className={`text-xs font-bold ${
                            p.salesTrendPercent > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatPercent(p.salesTrendPercent, language)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      {stock !== undefined ? (
                        <span
                          className={`badge ${
                            isLowStock ? 'badge-danger' : 'badge-success'
                          }`}
                        >
                          {stock} {language === 'ar' ? 'كرتونة' : 'units'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          {language === 'ar' ? 'غير محدد' : 'Unspecified'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
