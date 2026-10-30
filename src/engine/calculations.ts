/**
 * Business Insight AI - Calculation Engine
 * Pure, audited calculation functions for distributors
 */

import {
  StandardTransaction,
  MetricCardValue,
  OverviewMetrics,
  ProductPerformance,
  CustomerPerformance,
  TimeSeriesPoint,
  CategoryBreakdown,
  RegionalBreakdown,
  SalesRepBreakdown,
  BusinessAlert,
} from '../types/data';

/**
 * Format currency with proper localization
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'EGP',
  lang: 'ar' | 'en' = 'ar'
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return lang === 'ar' ? 'غير متوفر' : 'N/A';
  }

  const rounded = Math.round(amount * 100) / 100;
  const formattedNum = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded);

  const symbol =
    currency === 'EGP'
      ? lang === 'ar'
        ? 'ج.م'
        : 'EGP'
      : currency === 'SAR'
      ? lang === 'ar'
        ? 'ر.س'
        : 'SAR'
      : currency;

  return `${formattedNum} ${symbol}`;
}

/**
 * Format percentage safely
 */
export function formatPercent(
  percent: number | null | undefined,
  lang: 'ar' | 'en' = 'ar'
): string {
  if (percent === null || percent === undefined || isNaN(percent)) {
    return '—';
  }
  const formatted = Math.abs(percent).toFixed(1);
  const sign = percent > 0 ? '+' : percent < 0 ? '-' : '';
  return `${sign}${formatted}%`;
}

/**
 * Calculate distinct order count from line-item transactions
 */
export function calculateOrderCount(transactions: StandardTransaction[]): number {
  if (!transactions.length) return 0;
  const uniqueOrderIds = new Set<string>();
  let fallbackCount = 0;

  for (const t of transactions) {
    if (t.orderId && t.orderId.trim()) {
      uniqueOrderIds.add(t.orderId.trim());
    } else {
      fallbackCount++;
    }
  }

  return uniqueOrderIds.size > 0 ? uniqueOrderIds.size : fallbackCount;
}

/**
 * Calculate total gross revenue (sum of line quantity * unitPrice)
 */
export function calculateTotalGrossRevenue(transactions: StandardTransaction[]): number {
  let total = 0;
  for (const t of transactions) {
    total += t.grossRevenue || 0;
  }
  return Math.round(total * 100) / 100;
}

/**
 * Calculate total net revenue (grossRevenue - discount - returnAmount)
 */
export function calculateTotalNetRevenue(transactions: StandardTransaction[]): number {
  let total = 0;
  for (const t of transactions) {
    total += t.netRevenue || 0;
  }
  return Math.round(total * 100) / 100;
}

/**
 * Calculate average order value (AOV) = Net Revenue / Distinct Order Count
 */
export function calculateAverageOrderValue(transactions: StandardTransaction[]): number {
  const orderCount = calculateOrderCount(transactions);
  if (orderCount === 0) return 0;
  const netRevenue = calculateTotalNetRevenue(transactions);
  return Math.round((netRevenue / orderCount) * 100) / 100;
}

/**
 * Check whether cost information is present and reliable
 */
export function hasReliableCostData(transactions: StandardTransaction[]): boolean {
  if (!transactions.length) return false;
  // At least 60% of items must have valid non-null totalCost
  const itemsWithCost = transactions.filter(
    (t) => t.totalCost !== null && t.totalCost !== undefined && !isNaN(t.totalCost)
  );
  return itemsWithCost.length / transactions.length >= 0.6;
}

/**
 * Calculate gross profit (Net Revenue - Total Cost)
 * Returns null if cost data is insufficient to avoid inventing figures.
 */
export function calculateGrossProfit(transactions: StandardTransaction[]): number | null {
  if (!transactions.length || !hasReliableCostData(transactions)) {
    return null;
  }

  let totalProfit = 0;
  for (const t of transactions) {
    if (t.grossProfit !== null && t.grossProfit !== undefined && !isNaN(t.grossProfit)) {
      totalProfit += t.grossProfit;
    } else if (
      t.totalCost !== null &&
      t.totalCost !== undefined &&
      !isNaN(t.totalCost)
    ) {
      totalProfit += (t.netRevenue || 0) - t.totalCost;
    }
  }

  return Math.round(totalProfit * 100) / 100;
}

/**
 * Calculate gross profit margin % = (Gross Profit / Net Revenue) * 100
 * Returns null if cost data is missing or net revenue <= 0
 */
export function calculateGrossProfitMargin(
  transactions: StandardTransaction[]
): number | null {
  const profit = calculateGrossProfit(transactions);
  if (profit === null) return null;

  const netRevenue = calculateTotalNetRevenue(transactions);
  if (netRevenue <= 0) return 0;

  return Math.round((profit / netRevenue) * 1000) / 10;
}

/**
 * Count active unique customers
 */
export function calculateActiveCustomerCount(transactions: StandardTransaction[]): number {
  if (!transactions.length) return 0;
  const uniqueCustomers = new Set<string>();

  for (const t of transactions) {
    const key = (t.customerId || t.customerName || '').trim();
    if (key) {
      uniqueCustomers.add(key);
    }
  }

  return uniqueCustomers.size;
}

/**
 * Calculate total units sold
 */
export function calculateTotalUnitsSold(transactions: StandardTransaction[]): number {
  let units = 0;
  for (const t of transactions) {
    units += t.quantity || 0;
  }
  return units;
}

/**
 * Calculate percentage change safely: ((current - previous) / |previous|) * 100
 * Returns null if previous is null, 0, or not applicable
 */
export function calculatePercentageChange(
  current: number | null | undefined,
  previous: number | null | undefined
): number | null {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined ||
    isNaN(current) ||
    isNaN(previous) ||
    previous === 0
  ) {
    return null;
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;
  return Math.round(change * 10) / 10;
}

/**
 * Build the full Overview Metrics object comparing current period to previous
 */
export function calculateOverviewMetrics(
  currentItems: StandardTransaction[],
  previousItems: StandardTransaction[],
  currency: string = 'EGP',
  lang: 'ar' | 'en' = 'ar'
): OverviewMetrics {
  const currentNetRev = calculateTotalNetRevenue(currentItems);
  const prevNetRev = previousItems.length ? calculateTotalNetRevenue(previousItems) : null;
  const netRevChange = calculatePercentageChange(currentNetRev, prevNetRev);

  const currentGrossRev = calculateTotalGrossRevenue(currentItems);
  const prevGrossRev = previousItems.length ? calculateTotalGrossRevenue(previousItems) : null;
  const grossRevChange = calculatePercentageChange(currentGrossRev, prevGrossRev);

  const currentOrders = calculateOrderCount(currentItems);
  const prevOrders = previousItems.length ? calculateOrderCount(previousItems) : null;
  const ordersChange = calculatePercentageChange(currentOrders, prevOrders);

  const currentAov = calculateAverageOrderValue(currentItems);
  const prevAov = previousItems.length ? calculateAverageOrderValue(previousItems) : null;
  const aovChange = calculatePercentageChange(currentAov, prevAov);

  const currentProfit = calculateGrossProfit(currentItems);
  const prevProfit = previousItems.length ? calculateGrossProfit(previousItems) : null;
  const profitChange = calculatePercentageChange(currentProfit, prevProfit);

  const currentMargin = calculateGrossProfitMargin(currentItems);
  const prevMargin = previousItems.length ? calculateGrossProfitMargin(previousItems) : null;
  const marginChange =
    currentMargin !== null && prevMargin !== null
      ? Math.round((currentMargin - prevMargin) * 10) / 10
      : null;

  const currentCustomers = calculateActiveCustomerCount(currentItems);
  const prevCustomers = previousItems.length
    ? calculateActiveCustomerCount(previousItems)
    : null;
  const customersChange = calculatePercentageChange(currentCustomers, prevCustomers);

  const currentUnits = calculateTotalUnitsSold(currentItems);
  const prevUnits = previousItems.length ? calculateTotalUnitsSold(previousItems) : null;
  const unitsChange = calculatePercentageChange(currentUnits, prevUnits);

  const hasCost = hasReliableCostData(currentItems);

  return {
    totalNetRevenue: {
      title: lang === 'ar' ? 'صافي إيرادات المبيعات' : 'Net Sales Revenue',
      value: currentNetRev,
      formattedValue: formatCurrency(currentNetRev, currency, lang),
      previousValue: prevNetRev,
      changePercent: netRevChange,
      isPositiveChangeGood: true,
      isSufficientData: currentItems.length > 0,
      tooltip:
        lang === 'ar'
          ? 'إجمالي الإيرادات بعد خصم المرتجعات والخصومات التجارية.'
          : 'Total revenue after deducting commercial discounts and returns.',
    },
    totalGrossRevenue: {
      title: lang === 'ar' ? 'إجمالي المبيعات (Gross)' : 'Gross Sales Revenue',
      value: currentGrossRev,
      formattedValue: formatCurrency(currentGrossRev, currency, lang),
      previousValue: prevGrossRev,
      changePercent: grossRevChange,
      isPositiveChangeGood: true,
      isSufficientData: currentItems.length > 0,
      tooltip:
        lang === 'ar'
          ? 'مجموع قيمة البضائع المفوترة بالسعر الأصلي قبل أي خصم أو مرتجع.'
          : 'Total invoiced goods value before discounts or returns.',
    },
    orderCount: {
      title: lang === 'ar' ? 'عدد الطلبات (فواتير مميزة)' : 'Order Count',
      value: currentOrders,
      formattedValue: new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(
        currentOrders
      ),
      previousValue: prevOrders,
      changePercent: ordersChange,
      isPositiveChangeGood: true,
      isSufficientData: currentItems.length > 0,
      tooltip:
        lang === 'ar'
          ? 'عدد الفواتير أو أذون الصرف الفريدة دون تكرار أسطر الأصناف.'
          : 'Distinct orders/invoices count, not duplicate line items.',
    },
    averageOrderValue: {
      title: lang === 'ar' ? 'متوسط قيمة الطلب (AOV)' : 'Avg Order Value',
      value: currentAov,
      formattedValue: formatCurrency(currentAov, currency, lang),
      previousValue: prevAov,
      changePercent: aovChange,
      isPositiveChangeGood: true,
      isSufficientData: currentOrders > 0,
      tooltip:
        lang === 'ar'
          ? 'صافي الإيرادات مقسوماً على عدد الطلبات المميزة.'
          : 'Net revenue divided by distinct order count.',
    },
    grossProfit: {
      title: lang === 'ar' ? 'إجمالي الربح (Gross Profit)' : 'Gross Profit',
      value: currentProfit,
      formattedValue:
        currentProfit !== null
          ? formatCurrency(currentProfit, currency, lang)
          : lang === 'ar'
          ? 'بيانات غير كافية'
          : 'Insufficient data',
      previousValue: prevProfit,
      changePercent: profitChange,
      isPositiveChangeGood: true,
      isSufficientData: hasCost,
      tooltip:
        lang === 'ar'
          ? 'صافي الإيرادات ناقص تكلفة البضاعة المباعة (COGS). يتطلب توافر بيانات التكلفة في الملف.'
          : 'Net revenue minus Cost of Goods Sold. Requires cost data.',
      statusText: !hasCost
        ? lang === 'ar'
          ? 'بيانات التكلفة غير متوفرة في الملف'
          : 'Cost data missing in source file'
        : undefined,
    },
    grossProfitMargin: {
      title: lang === 'ar' ? 'هامش الربح الإجمالي' : 'Gross Profit Margin',
      value: currentMargin,
      formattedValue: currentMargin !== null ? `${currentMargin}%` : lang === 'ar' ? '—' : '—',
      previousValue: prevMargin,
      changePercent: marginChange,
      isPositiveChangeGood: true,
      isSufficientData: hasCost && currentMargin !== null,
      tooltip:
        lang === 'ar'
          ? 'نسبة إجمالي الربح إلى صافي الإيرادات (الربح ÷ الإيراد × 100).'
          : 'Percentage of net revenue that exceeds COGS (Profit / Net Revenue * 100).',
    },
    activeCustomerCount: {
      title: lang === 'ar' ? 'العملاء النشطون' : 'Active Customers',
      value: currentCustomers,
      formattedValue: new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(
        currentCustomers
      ),
      previousValue: prevCustomers,
      changePercent: customersChange,
      isPositiveChangeGood: true,
      isSufficientData: currentItems.length > 0,
      tooltip:
        lang === 'ar'
          ? 'عدد العملاء الذين قاموا بطلب واحد على الأقل خلال الفترة المحددة.'
          : 'Unique customer accounts with >= 1 order in selected period.',
    },
    totalUnitsSold: {
      title: lang === 'ar' ? 'إجمالي الوحدات المباعة' : 'Total Units Sold',
      value: currentUnits,
      formattedValue: new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(
        currentUnits
      ),
      previousValue: prevUnits,
      changePercent: unitsChange,
      isPositiveChangeGood: true,
      isSufficientData: currentItems.length > 0,
      tooltip:
        lang === 'ar'
          ? 'إجمالي عدد الكراتين أو القطع التي تم تسليمها.'
          : 'Total quantity of items or cartons delivered.',
    },
  };
}

/**
 * Calculate product performance breakdown
 */
export function calculateProductPerformance(
  currentItems: StandardTransaction[],
  previousItems: StandardTransaction[] = []
): ProductPerformance[] {
  const totalNet = calculateTotalNetRevenue(currentItems);
  const productMap = new Map<
    string,
    {
      productId: string;
      productName: string;
      category: string;
      unitsSold: number;
      grossRevenue: number;
      netRevenue: number;
      totalCost: number;
      hasValidCost: boolean;
      orderIds: Set<string>;
    }
  >();

  // Aggregate current period
  for (const t of currentItems) {
    const key = t.productId || t.productName || 'unknown';
    if (!productMap.has(key)) {
      productMap.set(key, {
        productId: t.productId || key,
        productName: t.productName || key,
        category: t.category || 'عام',
        unitsSold: 0,
        grossRevenue: 0,
        netRevenue: 0,
        totalCost: 0,
        hasValidCost: true,
        orderIds: new Set<string>(),
      });
    }

    const p = productMap.get(key)!;
    p.unitsSold += t.quantity || 0;
    p.grossRevenue += t.grossRevenue || 0;
    p.netRevenue += t.netRevenue || 0;
    if (t.totalCost !== null && t.totalCost !== undefined && !isNaN(t.totalCost)) {
      p.totalCost += t.totalCost;
    } else {
      p.hasValidCost = false;
    }
    if (t.orderId) p.orderIds.add(t.orderId);
  }

  // Aggregate previous period for trend
  const prevRevMap = new Map<string, number>();
  for (const t of previousItems) {
    const key = t.productId || t.productName || 'unknown';
    prevRevMap.set(key, (prevRevMap.get(key) || 0) + (t.netRevenue || 0));
  }

  const results: ProductPerformance[] = [];

  for (const [key, p] of productMap.entries()) {
    const prevRev = prevRevMap.get(key);
    const trendPercent =
      prevRev !== undefined && prevRev > 0
        ? calculatePercentageChange(p.netRevenue, prevRev)
        : null;

    const grossProfit = p.hasValidCost ? p.netRevenue - p.totalCost : null;
    const grossProfitMargin =
      grossProfit !== null && p.netRevenue > 0
        ? Math.round((grossProfit / p.netRevenue) * 1000) / 10
        : null;

    const sharePercent =
      totalNet > 0 ? Math.round((p.netRevenue / totalNet) * 1000) / 10 : 0;

    let status: ProductPerformance['status'] = 'regular';
    if (sharePercent >= 10) {
      status = 'top_seller';
    } else if (trendPercent !== null && trendPercent <= -20) {
      status = 'declining';
    } else if (p.unitsSold === 0) {
      status = 'zero_sales';
    }

    results.push({
      productId: p.productId,
      productName: p.productName,
      category: p.category,
      unitsSold: p.unitsSold,
      grossRevenue: Math.round(p.grossRevenue * 100) / 100,
      netRevenue: Math.round(p.netRevenue * 100) / 100,
      totalCost: p.hasValidCost ? Math.round(p.totalCost * 100) / 100 : null,
      grossProfit: grossProfit !== null ? Math.round(grossProfit * 100) / 100 : null,
      grossProfitMargin,
      revenueSharePercent: sharePercent,
      orderCount: p.orderIds.size,
      salesTrendPercent: trendPercent,
      status,
    });
  }

  // Sort by net revenue descending
  return results.sort((a, b) => b.netRevenue - a.netRevenue);
}

/**
 * Calculate customer performance and Pareto concentration
 */
export function calculateCustomerPerformance(
  transactions: StandardTransaction[]
): CustomerPerformance[] {
  if (!transactions.length) return [];

  const totalNet = calculateTotalNetRevenue(transactions);
  const customerMap = new Map<
    string,
    {
      customerId: string;
      customerName: string;
      region: string;
      orderIds: Set<string>;
      totalRevenue: number;
      dates: string[];
    }
  >();

  for (const t of transactions) {
    const key = t.customerId || t.customerName || 'unknown';
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        customerId: t.customerId || key,
        customerName: t.customerName || key,
        region: t.region || 'غير محدد',
        orderIds: new Set<string>(),
        totalRevenue: 0,
        dates: [],
      });
    }

    const c = customerMap.get(key)!;
    c.totalRevenue += t.netRevenue || 0;
    if (t.orderId) c.orderIds.add(t.orderId);
    if (t.orderDate) c.dates.push(t.orderDate);
  }

  const now = new Date();
  const results: CustomerPerformance[] = [];

  for (const [, c] of customerMap.entries()) {
    c.dates.sort();
    const firstOrderDate = c.dates[0] || '';
    const lastOrderDate = c.dates[c.dates.length - 1] || '';

    let daysSinceLastOrder = 0;
    if (lastOrderDate) {
      const last = new Date(lastOrderDate);
      daysSinceLastOrder = Math.max(
        0,
        Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    const orderCount = c.orderIds.size || 1;
    const avgOrderValue = Math.round((c.totalRevenue / orderCount) * 100) / 100;
    const sharePercent =
      totalNet > 0 ? Math.round((c.totalRevenue / totalNet) * 1000) / 10 : 0;

    results.push({
      customerId: c.customerId,
      customerName: c.customerName,
      region: c.region,
      orderCount,
      totalRevenue: Math.round(c.totalRevenue * 100) / 100,
      revenueSharePercent: sharePercent,
      avgOrderValue,
      firstOrderDate,
      lastOrderDate,
      daysSinceLastOrder,
      isRepeat: orderCount > 1,
      isDeclining: daysSinceLastOrder > 45 && orderCount > 2,
    });
  }

  // Sort by revenue descending
  return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Calculate time series for trends (daily / weekly aggregation)
 */
export function calculateTimeSeries(
  transactions: StandardTransaction[]
): TimeSeriesPoint[] {
  if (!transactions.length) return [];

  const dayMap = new Map<
    string,
    {
      revenue: number;
      netRevenue: number;
      orderIds: Set<string>;
      cost: number;
      hasCost: boolean;
    }
  >();

  for (const t of transactions) {
    const dateKey = t.orderDate || 'unknown';
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        revenue: 0,
        netRevenue: 0,
        orderIds: new Set<string>(),
        cost: 0,
        hasCost: true,
      });
    }

    const d = dayMap.get(dateKey)!;
    d.revenue += t.grossRevenue || 0;
    d.netRevenue += t.netRevenue || 0;
    if (t.orderId) d.orderIds.add(t.orderId);
    if (t.totalCost !== null && t.totalCost !== undefined) {
      d.cost += t.totalCost;
    } else {
      d.hasCost = false;
    }
  }

  const sortedDates = Array.from(dayMap.keys()).sort();

  return sortedDates.map((date) => {
    const d = dayMap.get(date)!;
    return {
      date,
      revenue: Math.round(d.revenue * 100) / 100,
      netRevenue: Math.round(d.netRevenue * 100) / 100,
      orderCount: d.orderIds.size || 1,
      grossProfit: d.hasCost ? Math.round((d.netRevenue - d.cost) * 100) / 100 : null,
    };
  });
}

/**
 * Calculate Category Breakdown
 */
export function calculateCategoryBreakdown(
  transactions: StandardTransaction[]
): CategoryBreakdown[] {
  const totalNet = calculateTotalNetRevenue(transactions);
  const catMap = new Map<
    string,
    { revenue: number; orderIds: Set<string>; profit: number; hasCost: boolean }
  >();

  for (const t of transactions) {
    const cat = t.category || 'أخرى';
    if (!catMap.has(cat)) {
      catMap.set(cat, {
        revenue: 0,
        orderIds: new Set<string>(),
        profit: 0,
        hasCost: true,
      });
    }

    const c = catMap.get(cat)!;
    c.revenue += t.netRevenue || 0;
    if (t.orderId) c.orderIds.add(t.orderId);
    if (t.grossProfit !== null && t.grossProfit !== undefined) {
      c.profit += t.grossProfit;
    } else {
      c.hasCost = false;
    }
  }

  const results: CategoryBreakdown[] = [];
  for (const [category, c] of catMap.entries()) {
    results.push({
      category,
      revenue: Math.round(c.revenue * 100) / 100,
      orderCount: c.orderIds.size,
      sharePercent:
        totalNet > 0 ? Math.round((c.revenue / totalNet) * 1000) / 10 : 0,
      grossProfit: c.hasCost ? Math.round(c.profit * 100) / 100 : null,
    });
  }

  return results.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculate Regional Breakdown
 */
export function calculateRegionalBreakdown(
  transactions: StandardTransaction[]
): RegionalBreakdown[] {
  const totalNet = calculateTotalNetRevenue(transactions);
  const regMap = new Map<string, { revenue: number; orderIds: Set<string> }>();

  for (const t of transactions) {
    const reg = t.region || 'غير محدد';
    if (!regMap.has(reg)) {
      regMap.set(reg, { revenue: 0, orderIds: new Set<string>() });
    }
    const r = regMap.get(reg)!;
    r.revenue += t.netRevenue || 0;
    if (t.orderId) r.orderIds.add(t.orderId);
  }

  const results: RegionalBreakdown[] = [];
  for (const [region, r] of regMap.entries()) {
    results.push({
      region,
      revenue: Math.round(r.revenue * 100) / 100,
      orderCount: r.orderIds.size,
      sharePercent:
        totalNet > 0 ? Math.round((r.revenue / totalNet) * 1000) / 10 : 0,
    });
  }

  return results.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculate Sales Rep Breakdown
 */
export function calculateSalesRepBreakdown(
  transactions: StandardTransaction[]
): SalesRepBreakdown[] {
  const repMap = new Map<string, { revenue: number; orderIds: Set<string> }>();

  for (const t of transactions) {
    const rep = t.salesRep || 'غير مسند';
    if (!repMap.has(rep)) {
      repMap.set(rep, { revenue: 0, orderIds: new Set<string>() });
    }
    const r = repMap.get(rep)!;
    r.revenue += t.netRevenue || 0;
    if (t.orderId) r.orderIds.add(t.orderId);
  }

  const results: SalesRepBreakdown[] = [];
  for (const [salesRep, r] of repMap.entries()) {
    const orderCount = r.orderIds.size || 1;
    results.push({
      salesRep,
      revenue: Math.round(r.revenue * 100) / 100,
      orderCount,
      avgOrderValue: Math.round((r.revenue / orderCount) * 100) / 100,
    });
  }

  return results.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Generate evidence-based business alerts
 */
export function generateBusinessAlerts(
  currentItems: StandardTransaction[],
  previousItems: StandardTransaction[],
  currency: string = 'EGP'
): BusinessAlert[] {
  const alerts: BusinessAlert[] = [];
  if (!currentItems.length) return alerts;

  const currentNet = calculateTotalNetRevenue(currentItems);
  const prevNet = previousItems.length ? calculateTotalNetRevenue(previousItems) : null;
  const netChange = calculatePercentageChange(currentNet, prevNet);

  // 1. Revenue Decline Alert
  if (netChange !== null && netChange <= -10) {
    alerts.push({
      id: 'alert-rev-decline',
      type: 'critical',
      titleAr: 'تراجع ملحوظ في صافي الإيرادات',
      titleEn: 'Significant Revenue Decline',
      evidenceAr: `انخفض صافي الإيرادات بنسبة ${Math.abs(
        netChange
      )}% مقارنة بالفترة السابقة (${formatCurrency(
        currentNet,
        currency,
        'ar'
      )} مقابل ${formatCurrency(prevNet!, currency, 'ar')}).`,
      evidenceEn: `Net revenue declined by ${Math.abs(
        netChange
      )}% vs previous period (${formatCurrency(
        currentNet,
        currency,
        'en'
      )} vs ${formatCurrency(prevNet!, currency, 'en')}).`,
      periodAr: 'مقارنة بالفترة المتطابقة السابقة',
      periodEn: 'Compared to previous equivalent period',
      recommendedActionAr:
        'مراجعة كبار العملاء المتراجعين وتحفيز مناديب المبيعات بعروض كميات على الأصناف سريعة الدوران.',
      recommendedActionEn:
        'Audit declining accounts and offer volume incentives on fast-moving SKUs.',
      reasonAr:
        'تم إطلاق التنبيه لأن نسبة التراجع تجاوزت الحد الحرج المحدد (10%).',
      reasonEn: 'Triggered because revenue decline exceeded 10% threshold.',
    });
  }

  // 2. Customer Concentration Risk
  const customers = calculateCustomerPerformance(currentItems);
  const topCustomer = customers[0];
  if (topCustomer && topCustomer.revenueSharePercent >= 20) {
    alerts.push({
      id: 'alert-cust-concentration',
      type: 'warning',
      titleAr: 'مخاطر تركز الإيرادات لدى عميل رئيسي',
      titleEn: 'High Customer Concentration Risk',
      evidenceAr: `العميل "${topCustomer.customerName}" يمثل ${topCustomer.revenueSharePercent}% من إجمالي مبيعات الشركة (${formatCurrency(
        topCustomer.totalRevenue,
        currency,
        'ar'
      )}).`,
      evidenceEn: `Client "${topCustomer.customerName}" represents ${topCustomer.revenueSharePercent}% of total revenue (${formatCurrency(
        topCustomer.totalRevenue,
        currency,
        'en'
      )}).`,
      periodAr: 'الفترة الحالية المحددة',
      periodEn: 'Current selected period',
      recommendedActionAr:
        'توسيع قاعدة العملاء وتنويع منافذ البيع لتجنب مخاطر التوقف المفاجئ أو طلب خصومات قاسية.',
      recommendedActionEn:
        'Diversify retail outlets and expand customer pipeline to mitigate single-client dependency.',
      reasonAr:
        'تم إطلاق التنبيه لأن حصة عميل واحد تخطت نسبة الـ 20% من المبيعات.',
      reasonEn: 'Triggered because single customer share exceeded 20% threshold.',
    });
  }

  // 3. Missing Cost Data Notice
  const hasCost = hasReliableCostData(currentItems);
  if (!hasCost) {
    alerts.push({
      id: 'alert-missing-cost',
      type: 'info',
      titleAr: 'بيانات تكلفة البضاعة غير مكتملة',
      titleEn: 'Incomplete Cost of Goods Data',
      evidenceAr:
        'أكثر من 40% من صفوف المبيعات تفتقر إلى سعر التكلفة للوحدة (Unit Cost)، مما يمنع الحساب الدقيق لإجمالي الأرباح.',
      evidenceEn:
        'Over 40% of sales rows lack unit cost, preventing accurate gross profit calculation.',
      periodAr: 'كامل مجموعة البيانات المحملة',
      periodEn: 'Across active dataset',
      recommendedActionAr:
        'قم بتعيين عمود "سعر التكلفة" في شاشة استيراد البيانات للحصول على هوامش الربحية.',
      recommendedActionEn:
        'Map the Unit Cost column in Data Import to unlock gross profit metrics.',
      reasonAr:
        'حجب حساب الأرباح تجنباً لتقديم أرقام وهمية أو مضللة لمتخذ القرار.',
      reasonEn:
        'Gross profit withheld to prevent speculative/misleading management figures.',
    });
  }

  // 4. Products with Severe Sales Decline
  const products = calculateProductPerformance(currentItems, previousItems);
  const severeDeclining = products.filter(
    (p) =>
      p.salesTrendPercent !== null &&
      p.salesTrendPercent !== undefined &&
      p.salesTrendPercent <= -35
  );
  if (severeDeclining.length > 0) {
    alerts.push({
      id: 'alert-declining-skus',
      type: 'warning',
      titleAr: `تراجع حاد في مبيعات ${severeDeclining.length} أصناف أساسية`,
      titleEn: `Sharp sales decline in ${severeDeclining.length} core SKUs`,
      evidenceAr: `أصناف مثل "${severeDeclining[0].productName}" هبطت مبيعاتها بأكثر من 35% مقارنة بالفترة السابقة.`,
      evidenceEn: `SKUs like "${severeDeclining[0].productName}" dropped by >35% vs previous period.`,
      periodAr: 'الفترة الحالية مقارنة بالسابقة',
      periodEn: 'Current vs Previous Period',
      recommendedActionAr:
        'التحقق من توفر المخزون، أو حدوث منافسة سعرية، أو قرب انتهاء الصلاحية.',
      recommendedActionEn:
        'Verify stock availability, competitor price cuts, or approaching expiry dates.',
      reasonAr:
        'هبوط مبيعات أصناف رئيسية يؤثر بشكل مباشر على السيولة وتدفق الكاش.',
      reasonEn: 'Declining primary SKUs directly impacts cashflow and working capital.',
    });
  }

  // 5. Positive Surge Opportunity
  if (netChange !== null && netChange >= 15) {
    alerts.push({
      id: 'alert-rev-growth',
      type: 'opportunity',
      titleAr: 'نمو قوي وموجة طلب متزايدة (+ ' + netChange + '%)',
      titleEn: 'Strong Sales Growth Surge (+ ' + netChange + '%)',
      evidenceAr: `ارتفعت المبيعات بنسبة ${netChange}% وبلغت ${formatCurrency(
        currentNet,
        currency,
        'ar'
      )}.`,
      evidenceEn: `Revenue increased by ${netChange}% reaching ${formatCurrency(
        currentNet,
        currency,
        'en'
      )}.`,
      periodAr: 'الفترة الحالية مقارنة بالسابقة',
      periodEn: 'Current vs Previous Period',
      recommendedActionAr:
        'التأكد من جاهزية أسطول التوزيع وتأمين أرصدة المستودعات لتفادي نفاد البضاعة.',
      recommendedActionEn:
        'Secure distributor warehouse reorders to avoid out-of-stock bottlenecks.',
      reasonAr: 'تجاوز نمو المبيعات حد الـ 15% الإيجابي.',
      reasonEn: 'Revenue growth surpassed 15% positive milestone.',
    });
  }

  return alerts;
}

/**
 * Filter transactions by date range
 */
export function filterTransactionsByDate(
  transactions: StandardTransaction[],
  startDate?: string,
  endDate?: string
): StandardTransaction[] {
  if (!startDate && !endDate) return transactions;

  return transactions.filter((t) => {
    if (!t.orderDate) return true;
    if (startDate && t.orderDate < startDate) return false;
    if (endDate && t.orderDate > endDate) return false;
    return true;
  });
}

/**
 * Detect duplicate candidate rows
 */
export function detectDuplicateCandidates(
  transactions: StandardTransaction[]
): StandardTransaction[] {
  const seen = new Map<string, StandardTransaction>();
  const duplicates: StandardTransaction[] = [];

  for (const t of transactions) {
    // A duplicate candidate has same orderId, same productId, same quantity, and same orderDate
    const key = `${t.orderId}_${t.productId}_${t.quantity}_${t.orderDate}`;
    if (seen.has(key)) {
      duplicates.push(t);
    } else {
      seen.set(key, t);
    }
  }

  return duplicates;
}
