/**
 * Business Insight AI - File Import & Data Validation Engine
 * Handles CSV & Excel parsing, intelligent Arabic/English column mapping,
 * and comprehensive business rule validation.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  ColumnMapping,
  RawTransaction,
  StandardTransaction,
  ValidationReport,
  ValidationIssue,
} from '../types/data';

export const DEFAULT_MAPPING: ColumnMapping = {
  orderId: '',
  orderDate: '',
  customerId: '',
  customerName: '',
  productId: '',
  productName: '',
  category: '',
  quantity: '',
  unitPrice: '',
  unitCost: '',
  discount: '',
  returnAmount: '',
  orderStatus: '',
  region: '',
  salesRep: '',
  stockQuantity: '',
};

/**
 * Intelligent Column Matcher
 * Maps detected headers in Arabic or English to standard field names
 */
export function autoDetectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = { ...DEFAULT_MAPPING };
  const normalized = headers.map((h) => ({
    original: h,
    clean: (h || '').toLowerCase().trim().replace(/[_-\s]+/g, ' '),
  }));

  const patterns: Record<keyof ColumnMapping, string[]> = {
    orderId: ['رقم الطلب', 'رقم الفاتورة', 'كود الفاتورة', 'اذن الصرف', 'order id', 'order_id', 'orderid', 'invoice', 'invoice no', 'bill no'],
    orderDate: ['تاريخ الطلب', 'تاريخ الفاتورة', 'التاريخ', 'تاريخ', 'order date', 'order_date', 'date', 'invoice date'],
    customerId: ['كود العميل', 'رقم العميل', 'معرف العميل', 'customer id', 'customer_id', 'cust id', 'client id'],
    customerName: ['اسم العميل', 'العميل', 'المشتري', 'المتجر', 'customer name', 'customer', 'client', 'customer_name', 'account'],
    productId: ['كود الصنف', 'كود المنتج', 'رمز الصنف', 'الباركود', 'product id', 'product_id', 'sku', 'item code'],
    productName: ['اسم الصنف', 'اسم المنتج', 'الصنف', 'المنتج', 'البيان', 'product name', 'product', 'item name', 'item', 'description'],
    category: ['التصنيف', 'المجموعة', 'القسم', 'الفئة', 'نوع الصنف', 'category', 'group', 'department', 'type'],
    quantity: ['الكمية', 'عدد', 'الكميات', 'كرتونة', 'قطعة', 'quantity', 'qty', 'units', 'count'],
    unitPrice: ['سعر الوحدة', 'السعر', 'سعر البيع', 'قيمة الوحدة', 'unit price', 'unit_price', 'price', 'selling price', 'rate'],
    unitCost: ['سعر التكلفة', 'التكلفة', 'تكلفة الوحدة', 'شراء', 'unit cost', 'unit_cost', 'cost', 'cogs', 'purchase price'],
    discount: ['الخصم', 'خصم تجاري', 'قيمة الخصم', 'تخفيض', 'discount', 'disc', 'allowance'],
    returnAmount: ['المرتجع', 'قيمة المرتجع', 'مرتجع', 'مردودات', 'return', 'returns', 'return amount'],
    orderStatus: ['حالة الطلب', 'الحالة', 'order status', 'status'],
    region: ['المحافظة', 'المنطقة', 'المدينة', 'الإقليم', 'region', 'area', 'governorate', 'city', 'zone'],
    salesRep: ['مندوب المبيعات', 'المندوب', 'مسؤول البيع', 'البائع', 'sales rep', 'rep', 'sales person', 'agent'],
    stockQuantity: ['رصيد المخزن', 'كمية المخزون', 'الرصيد الحالي', 'المخزون', 'stock', 'inventory', 'on hand'],
  };

  for (const [field, keywords] of Object.entries(patterns) as [keyof ColumnMapping, string[]][]) {
    for (const item of normalized) {
      if (keywords.some((kw) => item.clean === kw || item.clean.includes(kw))) {
        mapping[field] = item.original;
        break;
      }
    }
  }

  return mapping;
}

/**
 * Parse CSV File
 */
export function parseCsvFile(file: File): Promise<{ headers: string[]; rows: any[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({ headers, rows: results.data });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Parse Excel File (XLSX / XLS)
 */
export async function parseExcelFile(
  file: File
): Promise<{ sheetNames: string[]; activeSheet: string; headers: string[]; rows: any[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;
  const activeSheet = sheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[activeSheet];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return { sheetNames, activeSheet, headers, rows };
}

/**
 * Clean & Parse Numbers safely
 */
function parseNumeric(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleanStr = String(val)
    .replace(/[^0-9.-]/g, '')
    .trim();
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalize Date format to YYYY-MM-DD
 */
function normalizeDate(rawDate: any): string {
  if (!rawDate) return '';
  if (rawDate instanceof Date) {
    return rawDate.toISOString().slice(0, 10);
  }
  const str = String(rawDate).trim();
  // Try ISO or YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${y}-${m}-${d}`;
    } else {
      // DD/MM/YYYY
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${y}-${m}-${d}`;
    }
  }

  // Fallback Date constructor
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return '';
}

/**
 * Validate Dataset against mapped columns
 */
export function validateAndTransformDataset(
  rawRows: RawTransaction[],
  mapping: ColumnMapping
): {
  report: ValidationReport;
  validTransactions: StandardTransaction[];
  rejectedRows: { rowNumber: number; data: any; reason: string }[];
} {
  const issues: ValidationIssue[] = [];
  const validTransactions: StandardTransaction[] = [];
  const rejectedRows: { rowNumber: number; data: any; reason: string }[] = [];

  const missingCrucialFields: string[] = [];
  if (!mapping.productName) missingCrucialFields.push('اسم الصنف / Product Name');
  if (!mapping.unitPrice) missingCrucialFields.push('سعر الوحدة / Unit Price');
  if (!mapping.quantity) missingCrucialFields.push('الكمية / Quantity');

  const hasCost = Boolean(mapping.unitCost);
  let duplicateCount = 0;
  const seenRecords = new Set<string>();

  rawRows.forEach((row, index) => {
    const rowNumber = index + 1;
    let hasError = false;

    // Check empty row
    const rowValues = Object.values(row).filter((v) => v !== '' && v !== null && v !== undefined);
    if (rowValues.length === 0) {
      return; // Skip completely blank row
    }

    const orderId = mapping.orderId ? String(row[mapping.orderId] || '').trim() : `ORD-${rowNumber}`;
    const orderDateRaw = mapping.orderDate ? row[mapping.orderDate] : '';
    const orderDate = normalizeDate(orderDateRaw);

    if (orderDateRaw && !orderDate) {
      issues.push({
        rowNumber,
        column: mapping.orderDate,
        value: orderDateRaw,
        messageAr: 'تنسيق التاريخ غير صالح (يفضل YYYY-MM-DD أو DD/MM/YYYY).',
        messageEn: 'Invalid date format.',
        severity: 'warning',
      });
    }

    const productName = mapping.productName ? String(row[mapping.productName] || '').trim() : '';
    if (!productName) {
      issues.push({
        rowNumber,
        column: mapping.productName || 'productName',
        value: '',
        messageAr: 'اسم الصنف مفقود في هذا السطر.',
        messageEn: 'Missing product name.',
        severity: 'error',
      });
      hasError = true;
    }

    const rawQty = mapping.quantity ? row[mapping.quantity] : 1;
    const quantity = parseNumeric(rawQty);
    if (quantity <= 0) {
      issues.push({
        rowNumber,
        column: mapping.quantity || 'quantity',
        value: rawQty,
        messageAr: 'الكمية يجب أن تكون قيمة عددية موجبة أكبر من صفر.',
        messageEn: 'Quantity must be a positive number greater than zero.',
        severity: 'error',
      });
      hasError = true;
    }

    const rawPrice = mapping.unitPrice ? row[mapping.unitPrice] : 0;
    const unitPrice = parseNumeric(rawPrice);
    if (unitPrice < 0) {
      issues.push({
        rowNumber,
        column: mapping.unitPrice || 'unitPrice',
        value: rawPrice,
        messageAr: 'سعر الوحدة سالب وغير منطقي.',
        messageEn: 'Negative unit price is invalid.',
        severity: 'error',
      });
      hasError = true;
    }

    // Unit Cost
    let unitCost: number | null = null;
    let totalCost: number | null = null;
    if (mapping.unitCost && row[mapping.unitCost] !== '' && row[mapping.unitCost] !== undefined) {
      unitCost = parseNumeric(row[mapping.unitCost]);
      if (unitCost > unitPrice && unitPrice > 0) {
        issues.push({
          rowNumber,
          column: mapping.unitCost,
          value: unitCost,
          messageAr: `سعر التكلفة (${unitCost}) أعلى من سعر البيع (${unitPrice}). هامش ربح سالب.`,
          messageEn: `Unit cost (${unitCost}) exceeds selling price (${unitPrice}). Negative margin.`,
          severity: 'warning',
        });
      }
      totalCost = Math.round(quantity * unitCost * 100) / 100;
    }

    const discount = mapping.discount ? parseNumeric(row[mapping.discount]) : 0;
    const returnAmount = mapping.returnAmount ? parseNumeric(row[mapping.returnAmount]) : 0;
    const grossRevenue = Math.round(quantity * unitPrice * 100) / 100;
    const netRevenue = Math.max(0, Math.round((grossRevenue - discount - returnAmount) * 100) / 100);

    const grossProfit = totalCost !== null ? Math.round((netRevenue - totalCost) * 100) / 100 : null;
    const grossProfitMargin =
      grossProfit !== null && netRevenue > 0
        ? Math.round((grossProfit / netRevenue) * 1000) / 10
        : null;

    // Check duplicate
    const dedupeKey = `${orderId}_${productName}_${quantity}_${orderDate}`;
    if (seenRecords.has(dedupeKey)) {
      duplicateCount++;
      issues.push({
        rowNumber,
        column: 'orderId + productName',
        value: dedupeKey,
        messageAr: 'سجل مرشح كنسخة مكررة (نفس رقم الطلب والمنتج والكمية والتاريخ).',
        messageEn: 'Duplicate candidate row (same order, product, qty and date).',
        severity: 'warning',
      });
    } else {
      seenRecords.add(dedupeKey);
    }

    if (hasError) {
      rejectedRows.push({
        rowNumber,
        data: row,
        reason: issues
          .filter((i) => i.rowNumber === rowNumber && i.severity === 'error')
          .map((i) => i.messageAr)
          .join('; '),
      });
    } else {
      validTransactions.push({
        id: `imp-${rowNumber}-${Date.now()}`,
        orderId: orderId || `ORD-${rowNumber}`,
        orderDate: orderDate || new Date().toISOString().slice(0, 10),
        customerId: mapping.customerId ? String(row[mapping.customerId] || '').trim() : 'CUST-GEN',
        customerName: mapping.customerName
          ? String(row[mapping.customerName] || '').trim()
          : 'عميل عام نقدي',
        productId: mapping.productId ? String(row[mapping.productId] || '').trim() : `P-${rowNumber}`,
        productName,
        category: mapping.category ? String(row[mapping.category] || 'عام').trim() : 'عام',
        quantity,
        unitPrice,
        grossRevenue,
        unitCost,
        totalCost,
        discount,
        returnAmount,
        netRevenue,
        grossProfit,
        grossProfitMargin,
        orderStatus: 'completed',
        region: mapping.region ? String(row[mapping.region] || 'غير محدد').trim() : 'غير محدد',
        salesRep: mapping.salesRep ? String(row[mapping.salesRep] || 'غير مسند').trim() : undefined,
        isSynthetic: false,
      });
    }
  });

  const errorRowsCount = rejectedRows.length;
  const warningRowsCount = new Set(
    issues.filter((i) => i.severity === 'warning').map((i) => i.rowNumber)
  ).size;

  const report: ValidationReport = {
    totalRows: rawRows.length,
    validRows: validTransactions.length,
    warningRows: warningRowsCount,
    errorRows: errorRowsCount,
    duplicateCandidates: duplicateCount,
    issues,
    missingCrucialFields,
    hasCostData: hasCost,
  };

  return { report, validTransactions, rejectedRows };
}
