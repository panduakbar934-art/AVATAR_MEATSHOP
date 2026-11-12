import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateItemSubtotal,
  calculateCartTotal,
  parseDecimalInput,
  formatWeight,
  formatWeightGrams,
  validateStock,
  generateOrderId,
} from './currency';
import { calculateCartTotals } from './pricing';

test('single catalog price: calculates subtotal with decimal weight without rounding to 1 kg', () => {
  // Daging Sapi 135.000 / kg bought at 0.5 kg
  const subtotalHalfKg = calculateItemSubtotal(135000, 0.5);
  assert.equal(subtotalHalfKg, 67500);

  // Fillet Dada Ayam 58.000 / kg bought at 0.25 kg
  const subtotalQuarterKg = calculateItemSubtotal(58000, 0.25);
  assert.equal(subtotalQuarterKg, 14500);

  // Fillet Paha Ayam 61.000 / kg bought at 1.5 kg
  const subtotalOnePointFiveKg = calculateItemSubtotal(61000, 1.5);
  assert.equal(subtotalOnePointFiveKg, 91500);
});

test('parseDecimalInput parses both comma (,) and period (.) correctly', () => {
  assert.equal(parseDecimalInput('0,5'), 0.5);
  assert.equal(parseDecimalInput('0.5'), 0.5);
  assert.equal(parseDecimalInput('0,25'), 0.25);
  assert.equal(parseDecimalInput('0.75'), 0.75);
  assert.equal(parseDecimalInput('1,5'), 1.5);
  assert.equal(parseDecimalInput('2.5'), 2.5);
  assert.equal(parseDecimalInput(''), 0);
  assert.equal(parseDecimalInput('-1'), 0);
});

test('formatWeight displays comma for Indonesian decimals and formatWeightGrams converts properly', () => {
  assert.equal(formatWeight(0.5, 'kg'), '0,5 kg');
  assert.equal(formatWeight(1, 'kg'), '1 kg');
  assert.equal(formatWeight(1.5, 'kg'), '1,5 kg');
  assert.equal(formatWeightGrams(0.5), '500 gram');
  assert.equal(formatWeightGrams(0.25), '250 gram');
});

test('validateStock checks decimal quantity against available stock', () => {
  // Request 0.5 kg when 45.5 kg is available
  const validCheck = validateStock(0.5, 45.5, 'kg');
  assert.equal(validCheck.isValid, true);

  // Request 50 kg when 45.5 kg is available
  const excessCheck = validateStock(50, 45.5, 'kg');
  assert.equal(excessCheck.isValid, false);
  assert.match(excessCheck.message || '', /Stok tidak mencukupi/);

  // Request 0 kg
  const zeroCheck = validateStock(0, 45.5, 'kg');
  assert.equal(zeroCheck.isValid, false);
});

test('calculateCartTotals calculates subtotal and respects delivery vs pickup', () => {
  const items = [
    {
      productId: 'MEAT-001',
      product: { unit: 'kg' },
      quantity: 0.5,
      unitPrice: 135000,
      subtotal: 67500,
    },
    {
      productId: 'MEAT-004',
      product: { unit: 'kg' },
      quantity: 1.5,
      unitPrice: 58000,
      subtotal: 87000,
    },
  ];

  // Delivery method with 15.000 fee
  const deliveryResult = calculateCartTotals(items as any, 15000, 'delivery');
  assert.equal(deliveryResult.subtotal, 154500);
  assert.equal(deliveryResult.appliedDeliveryFee, 15000);
  assert.equal(deliveryResult.grandTotal, 169500);

  // Pickup method
  const pickupResult = calculateCartTotals(items as any, 15000, 'pickup');
  assert.equal(pickupResult.subtotal, 154500);
  assert.equal(pickupResult.appliedDeliveryFee, 0);
  assert.equal(pickupResult.grandTotal, 154500);
});

test('generateOrderId generates valid AVT-YYYYMMDD-XXXX format', () => {
  const orderId = generateOrderId();
  assert.match(orderId, /^AVT-\d{8}-[A-Z0-9]{4}$/);
});
