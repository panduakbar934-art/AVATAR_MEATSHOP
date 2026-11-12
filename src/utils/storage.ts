import { Product, Order, InventoryMovement, StoreSettings, CartItem } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { INITIAL_ORDERS, INITIAL_MOVEMENTS, INITIAL_SETTINGS } from '../data/initialInventory';
import { clearAllImages } from './imageStorage';

const STORAGE_KEYS = {
  PRODUCTS: 'avatar_meatshop_products_v3',
  ORDERS: 'avatar_meatshop_orders_v3',
  MOVEMENTS: 'avatar_meatshop_movements_v3',
  SETTINGS: 'avatar_meatshop_settings_v3',
  CART: 'avatar_meatshop_cart_v3',
  ADMIN_AUTH: 'avatar_meatshop_admin_auth_v3',
};

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export function loadProducts(): Product[] {
  const data = safeGetItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  if (!data || data.length === 0) {
    safeSetItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }
  return data;
}

export function saveProducts(products: Product[]): void {
  safeSetItem(STORAGE_KEYS.PRODUCTS, products);
}

export function loadOrders(): Order[] {
  const data = safeGetItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  if (!data || data.length === 0) {
    safeSetItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }
  return data;
}

export function saveOrders(orders: Order[]): void {
  safeSetItem(STORAGE_KEYS.ORDERS, orders);
}

export function loadMovements(): InventoryMovement[] {
  const data = safeGetItem<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
  if (!data || data.length === 0) {
    safeSetItem(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
    return INITIAL_MOVEMENTS;
  }
  return data;
}

export function saveMovements(movements: InventoryMovement[]): void {
  safeSetItem(STORAGE_KEYS.MOVEMENTS, movements);
}

export function loadSettings(): StoreSettings {
  return safeGetItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function saveSettings(settings: StoreSettings): void {
  safeSetItem(STORAGE_KEYS.SETTINGS, settings);
}

export function loadCart(): CartItem[] {
  return safeGetItem<CartItem[]>(STORAGE_KEYS.CART, []);
}

export function saveCart(cart: CartItem[]): void {
  safeSetItem(STORAGE_KEYS.CART, cart);
}

export function loadAdminAuth(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function saveAdminAuth(isAuthed: boolean): void {
  if (typeof window === 'undefined') return;
  if (isAuthed) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }
}

/**
 * Resets all demo data to default clean initial mock state and clears image cache
 */
export async function resetAllDemoData(): Promise<void> {
  if (typeof window === 'undefined') return;
  safeSetItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  safeSetItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  safeSetItem(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
  safeSetItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  safeSetItem(STORAGE_KEYS.CART, []);
  try {
    await clearAllImages();
  } catch (e) {
    console.error('Failed to clear images during reset:', e);
  }
}
