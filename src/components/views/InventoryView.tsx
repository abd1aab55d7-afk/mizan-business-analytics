import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../engine/calculations';
import {
  Boxes,
  AlertTriangle,
  Warehouse,
  ShieldCheck,
  TrendingDown,
  Info,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, currency, language, setActiveTab } = useApp();

  const totalValuation = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.totalValuation || 0), 0);
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantityOnHand <= item.reorderLevel);
  }, [inventory]);

  const totalUnits = useMemo(() => {
    return inventory.reduce((acc, item) => acc + item.quantityOnHand, 0);
  }, [inventory]);

  if (inventory.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Boxes size={32} />
        </div>
        <h3 className="font-bold text-slate-800 text-base">
          {language === 'ar'
            ? 'لا توجد بيانات مخزون محملة حالياً'
            : 'No inventory data currently available'}
        </h3>
        <p className="text-xs text-slate-500">
          {language === 'ar'
            ? 'المنصة لا تستنتج أرصدة المخزون من المبيعات وحدها. قم برفع ملف جرد أو تعيين عمود المخزون في شاشة الاستيراد.'
            : 'Stock levels are never inferred from sales data alone. Upload inventory or map stock columns in Data Import.'}
        </p>
        <button
          type="button"
          className="btn btn-primary btn-sm mx-auto"
          onClick={() => setActiveTab('import')}
        >
          {language === 'ar' ? 'الذهاب لمركز الاستيراد' : 'Go to Data Import'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inventory Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
        <Info size={17} className="text-teal-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600">
          <span className="font-bold text-slate-800">
            {language === 'ar' ? 'مبدأ شفافية المخزون: ' : 'Inventory Transparency: '}
          </span>
          {language === 'ar'
            ? 'الأرصدة المعروضة هي قيم فعلية مسجلة في ملف الجرد والمستودعات وليست تقديرات افتراضية. يتم احتساب قيمة المخزون بناءً على سعر التكلفة الفعلي للكرتونة/الوحدة.'
            : 'Stock numbers represent verified inventory records, never guessed from invoices. Valuation is computed from confirmed unit cost.'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Valuation */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">
              {language === 'ar' ? 'إجمالي قيمة المخزون (بالتكلفة)' : 'Total Stock Valuation (at Cost)'}
            </span>
            <div className="text-2xl font-extrabold text-teal-800 mt-1">
              {formatCurrency(totalValuation, currency, language)}
            </div>
            <span className="text-[11px] text-slate-400">
              {language === 'ar' ? 'مجموع تقييم كافة المستودعات' : 'Across all warehouses'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Warehouse size={20} />
          </div>
        </div>

        {/* Total Cartons/Units */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">
              {language === 'ar' ? 'إجمالي الأرصدة (كرتونة/قطعة)' : 'Total Quantity on Hand'}
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(totalUnits)}
            </div>
            <span className="text-[11px] text-slate-400">
              {language === 'ar' ? `موزعة على ${inventory.length} صنفاً` : `Across ${inventory.length} SKUs`}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Boxes size={20} />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">
              {language === 'ar' ? 'أصناف بلغت نقطة إعادة الطلب' : 'Low Stock Reorder Items'}
            </span>
            <div
              className={`text-2xl font-extrabold mt-1 ${
                lowStockItems.length > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {lowStockItems.length}
            </div>
            <span className="text-[11px] text-slate-400">
              {lowStockItems.length > 0
                ? language === 'ar'
                  ? 'يتطلب إصدار أوامر شراء جديدة'
                  : 'Purchase reorder suggested'
                : language === 'ar'
                ? 'المخزون آمن ومستقر'
                : 'Stock levels optimal'}
            </span>
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              lowStockItems.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {lowStockItems.length > 0 ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="table-container shadow-xs">
        <table className="data-table">
          <thead>
            <tr>
              <th>{language === 'ar' ? 'كود الصنف' : 'SKU'}</th>
              <th>{language === 'ar' ? 'اسم الصنف' : 'Product Name'}</th>
              <th>{language === 'ar' ? 'المستودع' : 'Warehouse'}</th>
              <th>{language === 'ar' ? 'الرصيد الفعلي' : 'On Hand'}</th>
              <th>{language === 'ar' ? 'حد إعادة الطلب' : 'Reorder Level'}</th>
              <th>{language === 'ar' ? 'سعر التكلفة' : 'Unit Cost'}</th>
              <th>{language === 'ar' ? 'إجمالي التقييم' : 'Valuation'}</th>
              <th>{language === 'ar' ? 'حالة المخزون' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const isCritical = item.quantityOnHand <= item.reorderLevel * 0.5;
              const isWarning = item.quantityOnHand <= item.reorderLevel;

              return (
                <tr key={item.productId}>
                  <td className="font-mono text-xs font-bold text-slate-500">
                    {item.productId}
                  </td>
                  <td>
                    <span className="font-bold text-slate-900">{item.productName}</span>
                  </td>
                  <td className="text-xs text-slate-600">{item.warehouse || '—'}</td>
                  <td className="font-extrabold text-slate-900">{item.quantityOnHand}</td>
                  <td className="text-slate-500 text-xs font-semibold">{item.reorderLevel}</td>
                  <td className="font-medium text-slate-700">
                    {formatCurrency(item.unitCost, currency, language)}
                  </td>
                  <td className="font-extrabold text-teal-800">
                    {formatCurrency(item.totalValuation, currency, language)}
                  </td>
                  <td>
                    {isCritical ? (
                      <span className="badge badge-danger">
                        {language === 'ar' ? 'حرج (نفاد وشيك)' : 'Critical Out of Stock'}
                      </span>
                    ) : isWarning ? (
                      <span className="badge badge-warning">
                        {language === 'ar' ? 'دون حد الطلب' : 'Below Reorder'}
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        {language === 'ar' ? 'رصيد كافٍ' : 'Optimal'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
