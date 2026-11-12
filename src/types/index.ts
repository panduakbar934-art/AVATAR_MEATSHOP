export type ProductCategory =
  | 'Daging Sapi'
  | 'Daging Ayam'
  | 'Produk Ayam'
  | 'Jeroan Ayam'
  | 'Jeroan Sapi'
  | 'Tulang Sapi'
  | 'Jeroan'
  | 'Produk Lainnya';

export type ProductUnit = 'kg' | 'pcs';

export interface Product {
  id: string; // e.g. "MEAT-001" or "AVT-001"
  name: string;
  category: ProductCategory;
  description: string;
  price: number; // single catalog price per unit (per kg or per pcs)
  unit: ProductUnit;
  stock: number; // available stock in kg (decimal allowed e.g. 15.5) or pcs
  image: string; // default/fallback photo url
  imageId?: string | null; // reference ID in IndexedDB for locally uploaded images
  isActive: boolean;
  isFeatured?: boolean;
  badge?: string;
  cost_price?: number; // for inventory accounting
  specifications?: {
    cut?: string;
    storage?: string;
    packaging?: string;
    origin?: string;
  };
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number; // weight in kg (decimal e.g. 0.5) or count in pcs (integer)
  unitPrice: number; // single catalog price per unit
  subtotal: number; // Math.round(quantity * unitPrice)
}

export type FulfillmentMethod = 'delivery' | 'pickup';
export type PaymentMethod = 'qris' | 'cod';
export type PaymentStatus = 'Belum Dibayar' | 'Lunas';
export type OrderStatus =
  | 'Menunggu Konfirmasi'
  | 'Diproses'
  | 'Siap Diambil'
  | 'Dalam Pengantaran'
  | 'Selesai'
  | 'Dibatalkan';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number; // decimal weight e.g. 0.5 kg or pcs count
  unit: ProductUnit;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string; // AVT-YYYYMMDD-XXXX
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderNotes?: string;
  fulfillmentMethod: FulfillmentMethod;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  total: number;
  createdAt: string;
  stockRestoredOnCancel?: boolean;
}

export type MovementType = 'Masuk' | 'Keluar' | 'Penjualan' | 'Pembatalan';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number; // can be decimal for kg
  unit?: ProductUnit;
  costPrice?: number;
  date: string;
  notes: string;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  storeAddress: string;
  operationalHours: string;
  deliveryFee: number;
  lowStockThreshold: number;
}
