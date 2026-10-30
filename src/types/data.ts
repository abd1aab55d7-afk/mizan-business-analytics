/**
 * Business Insight AI - Data Types
 * Comprehensive data model for Egyptian SME distributors
 */

export type Language = 'ar' | 'en';
export type Currency = 'EGP' | 'USD' | 'SAR' | 'EUR';

export interface RawTransaction {
  orderId?: string;
  orderDate?: string;
  customerId?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  category?: string;
  quantity?: number | string;
  unitPrice?: number | string;
  unitCost?: number | string;
  discount?: number | string;
  returnAmount?: number | string;
  paymentAmount?: number | string;
  orderStatus?: string;
  region?: string;
  salesRep?: string;
  stockQuantity?: number | string;
  [key: string]: any;
}

export interface StandardTransaction {
  id: string;
  orderId: string;
  orderDate: string; // ISO date string YYYY-MM-DD
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  grossRevenue: number; // quantity * unitPrice
  unitCost?: number | null; // null if not provided
  totalCost?: number | null; // quantity * unitCost (if unitCost is valid)
  discount: number;
  returnAmount: number;
  netRevenue: number; // grossRevenue - discount - returnAmount
  grossProfit?: number | null; // netRevenue - totalCost (only if totalCost != null)
  grossProfitMargin?: number | null; // (grossProfit / netRevenue) * 100
  orderStatus: 'completed' | 'pending' | 'returned' | 'cancelled';
  region: string;
  salesRep?: string;
  isSynthetic?: boolean;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  category: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost?: number | null;
  totalValuation?: number | null;
  warehouse?: string;
  lastMovementDate?: string;
}

export interface MetricCardValue {
  title: string;
  value: number | null;
  formattedValue: string;
  previousValue?: number | null;
  changePercent?: number | null;
  isPositiveChangeGood?: boolean;
  isSufficientData: boolean;
  tooltip: string;
  statusText?: string;
}

export interface OverviewMetrics {
  totalGrossRevenue: MetricCardValue;
  totalNetRevenue: MetricCardValue;
  orderCount: MetricCardValue;
  averageOrderValue: MetricCardValue;
  grossProfit: MetricCardValue;
  grossProfitMargin: MetricCardValue;
  activeCustomerCount: MetricCardValue;
  totalUnitsSold: MetricCardValue;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  unitsSold: number;
  grossRevenue: number;
  netRevenue: number;
  totalCost: number | null;
  grossProfit: number | null;
  grossProfitMargin: number | null;
  revenueSharePercent: number;
  orderCount: number;
  currentStock?: number | null;
  salesTrendPercent?: number | null; // comparison to previous equivalent period
  status: 'top_seller' | 'declining' | 'zero_sales' | 'low_stock' | 'regular';
}

export interface CustomerPerformance {
  customerId: string;
  customerName: string;
  region: string;
  orderCount: number;
  totalRevenue: number;
  revenueSharePercent: number;
  avgOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  isRepeat: boolean;
  isDeclining: boolean;
}

export interface TimeSeriesPoint {
  date: string; // label e.g. "2026-10-01" or "01 Oct"
  revenue: number;
  netRevenue: number;
  orderCount: number;
  grossProfit: number | null;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  orderCount: number;
  sharePercent: number;
  grossProfit: number | null;
}

export interface RegionalBreakdown {
  region: string;
  revenue: number;
  orderCount: number;
  sharePercent: number;
}

export interface SalesRepBreakdown {
  salesRep: string;
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface BusinessAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'opportunity';
  titleAr: string;
  titleEn: string;
  evidenceAr: string;
  evidenceEn: string;
  periodAr: string;
  periodEn: string;
  recommendedActionAr: string;
  recommendedActionEn: string;
  reasonAr: string;
  reasonEn: string;
  dismissed?: boolean;
}

export interface ColumnMapping {
  orderId: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  category: string;
  quantity: string;
  unitPrice: string;
  unitCost: string;
  discount: string;
  returnAmount: string;
  orderStatus: string;
  region: string;
  salesRep: string;
  stockQuantity: string;
}

export interface ValidationIssue {
  rowNumber: number;
  column: string;
  value: any;
  messageAr: string;
  messageEn: string;
  severity: 'error' | 'warning';
}

export interface ValidationReport {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  duplicateCandidates: number;
  issues: ValidationIssue[];
  missingCrucialFields: string[];
  hasCostData: boolean;
}

export type ActiveTab =
  | 'overview'
  | 'sales'
  | 'products'
  | 'customers'
  | 'inventory'
  | 'import'
  | 'reports'
  | 'analyst'
  | 'settings';

export interface DateFilter {
  preset: 'today' | 'last7' | 'last30' | 'thisQuarter' | 'thisYear' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
}
