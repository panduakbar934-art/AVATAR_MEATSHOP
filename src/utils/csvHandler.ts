import { Product, Order, InventoryMovement } from '../types';

export const CSV_EXPECTED_HEADERS = [
  'product_id',
  'name',
  'category',
  'price',
  'unit',
  'stock',
  'cost_price',
];

export interface CSVRowPreview {
  raw: Record<string, string>;
  product?: Partial<Product>;
  isValid: boolean;
  errors: string[];
}

/**
 * Escapes a single CSV value.
 */
function escapeCSVValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers a client-side download of a CSV file.
 */
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export products to CSV (Single catalog price)
 */
export function exportProductsToCSV(products: Product[]): void {
  const header = CSV_EXPECTED_HEADERS.join(',');
  const rows = products.map((p) =>
    [
      escapeCSVValue(p.id),
      escapeCSVValue(p.name),
      escapeCSVValue(p.category),
      p.price,
      escapeCSVValue(p.unit),
      p.stock,
      p.cost_price || 0,
    ].join(',')
  );
  const csvContent = [header, ...rows].join('\n');
  downloadCSV(`avatar_meatshop_products_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

/**
 * Export inventory status to CSV
 */
export function exportInventoryToCSV(products: Product[]): void {
  const headers = ['product_id', 'name', 'category', 'stock', 'unit', 'cost_price', 'inventory_value', 'stock_status'];
  const rows = products.map((p) => {
    const invValue = Math.round(p.stock * (p.cost_price || 0));
    const status = p.stock <= 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'In Stock';
    return [
      escapeCSVValue(p.id),
      escapeCSVValue(p.name),
      escapeCSVValue(p.category),
      p.stock,
      escapeCSVValue(p.unit),
      p.cost_price || 0,
      invValue,
      escapeCSVValue(status),
    ].join(',');
  });
  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(`avatar_meatshop_inventory_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

/**
 * Export orders to CSV
 */
export function exportOrdersToCSV(orders: Order[]): void {
  const headers = [
    'order_id',
    'customer_name',
    'customer_phone',
    'order_date',
    'fulfillment_method',
    'payment_method',
    'payment_status',
    'order_status',
    'items_count',
    'subtotal',
    'delivery_fee',
    'total_amount',
  ];
  const rows = orders.map((o) =>
    [
      escapeCSVValue(o.id),
      escapeCSVValue(o.customerName),
      escapeCSVValue(o.customerPhone),
      escapeCSVValue(o.createdAt),
      escapeCSVValue(o.fulfillmentMethod),
      escapeCSVValue(o.paymentMethod),
      escapeCSVValue(o.paymentStatus),
      escapeCSVValue(o.orderStatus),
      o.items.length,
      o.subtotal,
      o.deliveryFee,
      o.total,
    ].join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(`avatar_meatshop_orders_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

/**
 * Export inventory movement audit log to CSV
 */
export function exportMovementsToCSV(movements: InventoryMovement[]): void {
  const headers = ['movement_id', 'date', 'product_id', 'product_name', 'type', 'quantity', 'cost_price', 'notes'];
  const rows = movements.map((m) =>
    [
      escapeCSVValue(m.id),
      escapeCSVValue(m.date),
      escapeCSVValue(m.productId),
      escapeCSVValue(m.productName),
      escapeCSVValue(m.type),
      m.quantity,
      m.costPrice || 0,
      escapeCSVValue(m.notes),
    ].join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(`avatar_meatshop_movements_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

/**
 * Simple CSV Parser that handles quoted commas, semicolons, and line breaks.
 */
export function parseCSVText(text: string): { headers: string[]; rows: string[][] } {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Find header line (skip blank or decorative title lines)
  let headerIndex = 0;
  for (let idx = 0; idx < lines.length; idx++) {
    const l = lines[idx].toLowerCase();
    if (l.includes('product_id') || l.includes('nama produk') || l.includes('kategori')) {
      headerIndex = idx;
      break;
    }
  }

  // Detect delimiter in header line
  const sampleHeader = lines[headerIndex] || lines[0];
  const semicolonCount = (sampleHeader.match(/;/g) || []).length;
  const commaCount = (sampleHeader.match(/,/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let currentVal = '';
    let inside = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const next = line[i + 1];

      if (c === '"') {
        if (inside && next === '"') {
          currentVal += '"';
          i++;
        } else {
          inside = !inside;
        }
      } else if (c === delimiter && !inside) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += c;
      }
    }
    values.push(currentVal.trim());
    return values;
  };

  const headers = parseRow(lines[headerIndex]).map((h) => h.toLowerCase().trim().replace(/^[\uFEFF]/, ''));
  const rows = lines.slice(headerIndex + 1).map(parseRow).filter((r) => r.some((cell) => cell.trim().length > 0));

  return { headers, rows };
}

/**
 * Validates and transforms uploaded CSV text into Product preview rows
 * Supports both standard system CSV and Indonesian catalog CSV (No.;Nama Produk;Kategori;Satuan;Harga;Gambar)
 */
export function validateAndPreviewCSV(csvText: string): {
  isValidHeader: boolean;
  headerError?: string;
  previews: CSVRowPreview[];
} {
  const { headers, rows } = parseCSVText(csvText);

  // Check for Indonesian format: nama produk, kategori, harga
  const isIndoFormat =
    (headers.includes('nama produk') || headers.includes('nama')) &&
    headers.includes('kategori') &&
    (headers.includes('harga') || headers.includes('harga eceran'));

  // Check required standard headers
  const missingStandard = CSV_EXPECTED_HEADERS.filter((exp) => !headers.includes(exp));

  if (!isIndoFormat && missingStandard.length > 0) {
    return {
      isValidHeader: false,
      headerError: `Header CSV tidak sesuai. Kolom yang hilang: ${missingStandard.join(', ')}. Format didukung: (1) Standard: ${CSV_EXPECTED_HEADERS.join(', ')} atau (2) Katalog: No., Nama Produk, Kategori, Satuan, Harga`,
      previews: [],
    };
  }

  const previews: CSVRowPreview[] = rows.map((row, rowIdx) => {
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = row[idx] || '';
    });

    const errors: string[] = [];
    let productId = '';
    let name = '';
    let category: Product['category'] = 'Daging Sapi';
    let price = 0;
    let unit: 'kg' | 'pcs' = 'kg';
    let stock = 50;
    let costPrice = 0;

    if (isIndoFormat) {
      name = raw['nama produk'] || raw['nama'] || '';
      const catRaw = raw['kategori'] || '';
      category = (catRaw.trim() as Product['category']) || 'Daging Sapi';
      const unitRaw = (raw['satuan'] || 'kg').toLowerCase();
      unit = unitRaw.includes('pcs') ? 'pcs' : 'kg';

      // Parse Rupiah currency e.g. "Rp135.000" or "135000"
      const rawPrice = raw['harga'] || raw['harga eceran'] || '0';
      const cleanNum = Number(rawPrice.replace(/[^\d]/g, ''));
      price = cleanNum || 0;
      costPrice = Math.round((price * 0.78) / 1000) * 1000;
      productId = raw['no.'] || raw['no'] ? `MEAT-${String(raw['no.'] || raw['no']).padStart(3, '0')}` : `MEAT-NEW-${rowIdx + 1}`;

      raw.product_id = productId;
      raw.price = String(price);
      raw.stock = String(stock);
      raw.cost_price = String(costPrice);
    } else {
      productId = raw.product_id?.trim() || '';
      name = raw.name?.trim() || '';
      category = raw.category?.trim() as Product['category'];
      price = Number(raw.price || raw.retail_price || 0);
      const unitRaw = (raw.unit?.trim() || 'kg').toLowerCase();
      unit = unitRaw.includes('pcs') ? 'pcs' : 'kg';
      stock = Number(raw.stock);
      costPrice = Number(raw.cost_price);
    }

    if (!productId) errors.push('ID produk wajib diisi.');
    if (!name) errors.push('Nama produk wajib diisi.');
    if (isNaN(price) || price < 0) errors.push('Harga harus berupa angka positif.');
    if (isNaN(stock) || stock < 0) errors.push('Stok harus berupa angka >= 0.');
    if (isNaN(costPrice) || costPrice < 0) errors.push('Harga beli (cost) harus berupa angka >= 0.');

    const isValid = errors.length === 0;

    const product: Partial<Product> = {
      id: productId,
      name,
      category: category || 'Daging Sapi',
      price: price || 0,
      unit,
      stock: stock || 0,
      cost_price: costPrice || 0,
      isActive: true,
    };

    return { raw, product, isValid, errors };
  });

  return {
    isValidHeader: true,
    previews,
  };
}
