import { Product, CartItem } from '../types';
import { parseDecimalInput, calculateItemSubtotal } from './currency';

export interface ItemPriceCalculation {
  unitPrice: number;
  subtotal: number;
  quantity: number;
}

/**
 * Calculates item pricing based on single catalog price and actual weight/quantity.
 * Single catalog pricing: No wholesale tiers, no automatic discounts.
 * Formula: Subtotal = Quantity × Price per Unit (rounded to Rupiah).
 */
export function calculateItemPrice(
  product: Pick<Product, 'price'>,
  quantity: number | string
): ItemPriceCalculation {
  const safeQty = parseDecimalInput(quantity);
  const unitPrice = Math.max(0, product.price || 0);
  const subtotal = calculateItemSubtotal(unitPrice, safeQty);

  return {
    unitPrice,
    subtotal,
    quantity: safeQty,
  };
}

/**
 * Calculates cart totals based on single catalog pricing and decimal weights.
 */
export function calculateCartTotals(
  items: Array<{
    unitPrice: number;
    quantity: number;
    subtotal?: number;
    product?: Pick<Product, 'unit'>;
  }>,
  deliveryFee: number = 0,
  fulfillmentMethod: 'delivery' | 'pickup' = 'delivery'
) {
  let subtotal = 0;
  let totalWeightKg = 0;

  for (const item of items) {
    const itemSub = item.subtotal !== undefined
      ? item.subtotal
      : calculateItemSubtotal(item.unitPrice, item.quantity);
    subtotal += itemSub;

    if (item.product?.unit === 'kg') {
      totalWeightKg += item.quantity;
    }
  }

  const appliedDeliveryFee = fulfillmentMethod === 'delivery' ? deliveryFee : 0;
  const grandTotal = subtotal + appliedDeliveryFee;

  return {
    subtotal,
    totalSavings: 0, // No wholesale/discount system
    totalItemsCount: items.length,
    totalWeightKg: Math.round(totalWeightKg * 1000) / 1000,
    appliedDeliveryFee,
    grandTotal,
  };
}

/**
 * Generates an order ID matching the PRD specification:
 * Format: AVT-YYYYMMDD-XXXX
 */
export function generateOrderId(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `AVT-${year}${month}${day}-${randomPart}`;
}
