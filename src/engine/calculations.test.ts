/**
 * Unit tests for Business Insight AI calculation engine
 * Executed via node:test and node:assert/strict
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderCount,
  calculateTotalGrossRevenue,
  calculateTotalNetRevenue,
  calculateAverageOrderValue,
  calculateGrossProfit,
  calculateGrossProfitMargin,
  calculatePercentageChange,
  calculateProductPerformance,
  calculateCustomerPerformance,
  detectDuplicateCandidates,
  hasReliableCostData,
  formatCurrency,
  formatPercent,
} from './calculations';
import { StandardTransaction } from '../types/data';

test('Empty dataset handling returns zeroes and safe defaults', () => {
  const empty: StandardTransaction[] = [];
  assert.equal(calculateOrderCount(empty), 0);
  assert.equal(calculateTotalGrossRevenue(empty), 0);
  assert.equal(calculateTotalNetRevenue(empty), 0);
  assert.equal(calculateAverageOrderValue(empty), 0);
  assert.equal(calculateGrossProfit(empty), null);
  assert.equal(calculateGrossProfitMargin(empty), null);
  assert.equal(hasReliableCostData(empty), false);
});

test('Multi-line orders: distinct order counts without double-counting', () => {
  // Order ORD-101 has 3 line items for different products
  const multiLine: StandardTransaction[] = [
    {
      id: '1',
      orderId: 'ORD-101',
      orderDate: '2026-10-01',
      customerId: 'CUST-1',
      customerName: 'سوبرماركت الأمل',
      productId: 'P-1',
      productName: 'زيت عباد الشمس 1 لتر',
      category: 'زيوت وسمن',
      quantity: 10,
      unitPrice: 70,
      grossRevenue: 700,
      unitCost: 55,
      totalCost: 550,
      discount: 20,
      returnAmount: 0,
      netRevenue: 680,
      grossProfit: 130,
      orderStatus: 'completed',
      region: 'القاهرة',
    },
    {
      id: '2',
      orderId: 'ORD-101',
      orderDate: '2026-10-01',
      customerId: 'CUST-1',
      customerName: 'سوبرماركت الأمل',
      productId: 'P-2',
      productName: 'سكر أبيض 1 كجم',
      category: 'بقالة',
      quantity: 20,
      unitPrice: 35,
      grossRevenue: 700,
      unitCost: 28,
      totalCost: 560,
      discount: 0,
      returnAmount: 0,
      netRevenue: 700,
      grossProfit: 140,
      orderStatus: 'completed',
      region: 'القاهرة',
    },
    {
      id: '3',
      orderId: 'ORD-102',
      orderDate: '2026-10-02',
      customerId: 'CUST-2',
      customerName: 'ماركت النور',
      productId: 'P-1',
      productName: 'زيت عباد الشمس 1 لتر',
      category: 'زيوت وسمن',
      quantity: 5,
      unitPrice: 70,
      grossRevenue: 350,
      unitCost: 55,
      totalCost: 275,
      discount: 0,
      returnAmount: 50,
      netRevenue: 300,
      grossProfit: 25,
      orderStatus: 'completed',
      region: 'الجيزة',
    },
  ];

  // Distinct order count should be 2 (ORD-101 and ORD-102), NOT 3 rows
  assert.equal(calculateOrderCount(multiLine), 2);

  // Total gross revenue: 700 + 700 + 350 = 1750
  assert.equal(calculateTotalGrossRevenue(multiLine), 1750);

  // Total net revenue: 680 + 700 + 300 = 1680 (accounts for discounts and returns)
  assert.equal(calculateTotalNetRevenue(multiLine), 1680);

  // Average order value: 1680 / 2 = 840
  assert.equal(calculateAverageOrderValue(multiLine), 840);

  // Gross profit: 130 + 140 + 25 = 295
  assert.equal(calculateGrossProfit(multiLine), 295);

  // Gross profit margin: (295 / 1680) * 100 = 17.559... -> 17.6%
  const margin = calculateGrossProfitMargin(multiLine);
  assert.ok(margin !== null && Math.abs(margin - 17.6) < 0.1);
});

test('Missing cost data: never invents gross profit', () => {
  const noCostData: StandardTransaction[] = [
    {
      id: '1',
      orderId: 'ORD-201',
      orderDate: '2026-10-05',
      customerId: 'CUST-3',
      customerName: 'محل البركة',
      productId: 'P-9',
      productName: 'شاي أسود 250 جم',
      category: 'مشروبات',
      quantity: 50,
      unitPrice: 40,
      grossRevenue: 2000,
      unitCost: null, // Cost missing!
      totalCost: null,
      discount: 0,
      returnAmount: 0,
      netRevenue: 2000,
      grossProfit: null,
      orderStatus: 'completed',
      region: 'الإسكندرية',
    },
  ];

  assert.equal(hasReliableCostData(noCostData), false);
  assert.equal(calculateGrossProfit(noCostData), null);
  assert.equal(calculateGrossProfitMargin(noCostData), null);
});

test('Percentage change calculations handle zero denominators safely', () => {
  // From 100 to 125 -> +25%
  assert.equal(calculatePercentageChange(125, 100), 25);
  // From 100 to 80 -> -20%
  assert.equal(calculatePercentageChange(80, 100), -20);
  // Previous was 0 -> cannot divide by zero, returns null
  assert.equal(calculatePercentageChange(100, 0), null);
  // Null inputs -> returns null
  assert.equal(calculatePercentageChange(null, 100), null);
  assert.equal(calculatePercentageChange(100, null), null);
});

test('Duplicate candidate detection identifies identical line items', () => {
  const items: StandardTransaction[] = [
    {
      id: '1',
      orderId: 'ORD-301',
      orderDate: '2026-10-10',
      customerId: 'CUST-1',
      customerName: 'عميل 1',
      productId: 'P-1',
      productName: 'منتج 1',
      category: 'عام',
      quantity: 10,
      unitPrice: 100,
      grossRevenue: 1000,
      discount: 0,
      returnAmount: 0,
      netRevenue: 1000,
      orderStatus: 'completed',
      region: 'القاهرة',
    },
    {
      id: '2',
      orderId: 'ORD-301',
      orderDate: '2026-10-10',
      customerId: 'CUST-1',
      customerName: 'عميل 1',
      productId: 'P-1',
      productName: 'منتج 1',
      category: 'عام',
      quantity: 10,
      unitPrice: 100,
      grossRevenue: 1000,
      discount: 0,
      returnAmount: 0,
      netRevenue: 1000,
      orderStatus: 'completed',
      region: 'القاهرة',
    },
  ];

  const dups = detectDuplicateCandidates(items);
  assert.equal(dups.length, 1);
});

test('Customer Pareto and concentration metrics', () => {
  const items: StandardTransaction[] = [
    {
      id: '1',
      orderId: 'ORD-1',
      orderDate: '2026-10-01',
      customerId: 'VIP-1',
      customerName: 'شركة النيل للتجارة',
      productId: 'P-1',
      productName: 'صنف 1',
      category: 'عام',
      quantity: 100,
      unitPrice: 100,
      grossRevenue: 10000,
      discount: 0,
      returnAmount: 0,
      netRevenue: 10000,
      orderStatus: 'completed',
      region: 'القاهرة',
    },
    {
      id: '2',
      orderId: 'ORD-2',
      orderDate: '2026-10-02',
      customerId: 'SMALL-1',
      customerName: 'بقالة التحرير',
      productId: 'P-1',
      productName: 'صنف 1',
      category: 'عام',
      quantity: 10,
      unitPrice: 100,
      grossRevenue: 1000,
      discount: 0,
      returnAmount: 0,
      netRevenue: 1000,
      orderStatus: 'completed',
      region: 'الجيزة',
    },
  ];

  const custPerf = calculateCustomerPerformance(items);
  assert.equal(custPerf.length, 2);
  assert.equal(custPerf[0].customerId, 'VIP-1');
  // Total is 11,000. VIP-1 has 10,000 -> (10000/11000) * 100 ~= 90.9%
  assert.ok(custPerf[0].revenueSharePercent > 90);
});

test('Formatting functions work seamlessly for Arabic and English', () => {
  const currAr = formatCurrency(5420.5, 'EGP', 'ar');
  assert.ok(currAr.includes('ج.م'));
  const currEn = formatCurrency(5420.5, 'EGP', 'en');
  assert.ok(currEn.includes('EGP'));

  assert.equal(formatPercent(15.2, 'ar'), '+15.2%');
  assert.equal(formatPercent(-8.5, 'ar'), '-8.5%');
  assert.equal(formatPercent(null, 'ar'), '—');
});
