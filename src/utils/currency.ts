/**
 * Formats a number to Indonesian Rupiah currency string.
 * Example: 120000 -> "Rp 120.000"
 */
export function formatIDR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount)).replace('IDR', 'Rp');
}

/**
 * Alias for formatIDR as requested by PRD revision
 */
export const formatCurrency = formatIDR;

/**
 * Formats a number as plain formatted number with thousand separators and Indonesian decimal comma.
 * Example: 1200 -> "1.200", 1.5 -> "1,5"
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 3,
  }).format(num);
}

/**
 * Formats a weight or quantity nicely for display.
 * Example: 0.5, 'kg' -> "0,5 kg"
 * Example: 1, 'kg' -> "1 kg"
 * Example: 10, 'pcs' -> "10 pcs"
 */
export function formatWeight(qty: number | null | undefined, unit: string = 'kg'): string {
  if (qty === null || qty === undefined || isNaN(qty)) {
    return `0 ${unit}`;
  }
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(qty);
  return `${formatted} ${unit}`;
}

/**
 * Returns estimated weight in grams for kg inputs.
 * Example: 0.5 -> "500 gram"
 * Example: 1 -> "1.000 gram"
 * Example: 0.25 -> "250 gram"
 */
export function formatWeightGrams(weightInKg: number | null | undefined): string {
  if (weightInKg === null || weightInKg === undefined || isNaN(weightInKg)) {
    return '0 gram';
  }
  const grams = Math.round(weightInKg * 1000);
  return `${formatNumber(grams)} gram`;
}

/**
 * Parses user input into a valid decimal number.
 * Accepts both comma (,) and period (.) as decimal separator.
 * Example: "0,5" -> 0.5
 * Example: "0.25" -> 0.25
 * Example: "1,250" -> 1.25
 */
export function parseDecimalInput(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : Math.max(0, input);
  }
  const trimmed = String(input).trim();
  if (!trimmed) return 0;

  // Replace comma with period for standard JavaScript float parsing
  const standardized = trimmed.replace(',', '.');
  const parsed = parseFloat(standardized);
  if (isNaN(parsed) || parsed < 0) return 0;

  // Round to 3 decimal places to prevent floating point inaccuracies
  return Math.round(parsed * 1000) / 1000;
}

/**
 * Calculates item subtotal from unit price and quantity.
 * Single catalog pricing: Subtotal = Quantity × Unit Price (rounded to nearest Rupiah).
 */
export function calculateItemSubtotal(pricePerUnit: number, quantity: number): number {
  const qty = parseDecimalInput(quantity);
  const price = Math.max(0, pricePerUnit || 0);
  return Math.round(qty * price);
}

/**
 * Calculates cart total, subtotal, and total item count/weight.
 */
export function calculateCartTotal(
  items: Array<{ unitPrice: number; quantity: number; product?: { unit?: string } }>,
  deliveryFee: number = 0
): {
  subtotal: number;
  total: number;
  totalWeightKg: number;
  totalItemsCount: number;
} {
  let subtotal = 0;
  let totalWeightKg = 0;

  items.forEach((item) => {
    const itemSub = calculateItemSubtotal(item.unitPrice, item.quantity);
    subtotal += itemSub;
    if (item.product?.unit === 'kg') {
      totalWeightKg += item.quantity;
    }
  });

  const total = subtotal + Math.max(0, deliveryFee || 0);

  return {
    subtotal,
    total,
    totalWeightKg: Math.round(totalWeightKg * 1000) / 1000,
    totalItemsCount: items.length,
  };
}

/**
 * Validates stock availability against requested quantity.
 */
export function validateStock(
  requestedQty: number,
  availableStock: number,
  unit: string = 'kg'
): { isValid: boolean; message?: string } {
  const req = parseDecimalInput(requestedQty);
  if (req <= 0) {
    return {
      isValid: false,
      message: 'Jumlah atau berat pembelian harus lebih dari 0.',
    };
  }
  if (req > availableStock) {
    return {
      isValid: false,
      message: `Stok tidak mencukupi (tersedia: ${formatWeight(availableStock, unit)}).`,
    };
  }
  return { isValid: true };
}

/**
 * Generates unique Order ID format: AVT-YYYYMMDD-XXXX
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AVT-${year}${month}${day}-${randomStr}`;
}
