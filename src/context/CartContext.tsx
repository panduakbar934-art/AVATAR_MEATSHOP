import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { loadCart, saveCart } from '../utils/storage';
import { calculateCartTotals } from '../utils/pricing';
import { parseDecimalInput, calculateItemSubtotal } from '../utils/currency';
import { useStore } from './StoreContext';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number | string) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number | string) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totals: {
    subtotal: number;
    totalSavings: number;
    totalItemsCount: number;
    totalWeightKg: number;
    appliedDeliveryFee: number;
    grandTotal: number;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, products } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setIsLoaded(true);
  }, []);

  // Sync cart item product data if prices/names change in store
  useEffect(() => {
    if (!isLoaded || cart.length === 0) return;
    let changed = false;
    const updatedCart = cart.map((item) => {
      const freshProduct = products.find((p) => p.id === item.productId);
      if (freshProduct) {
        const freshPrice = freshProduct.price;
        const freshSubtotal = calculateItemSubtotal(freshPrice, item.quantity);
        if (
          item.unitPrice !== freshPrice ||
          item.subtotal !== freshSubtotal ||
          item.product.name !== freshProduct.name ||
          item.product.stock !== freshProduct.stock
        ) {
          changed = true;
          return {
            ...item,
            product: freshProduct,
            unitPrice: freshPrice,
            subtotal: freshSubtotal,
          };
        }
      }
      return item;
    });

    if (changed) {
      setCart(updatedCart);
      saveCart(updatedCart);
    }
  }, [products, isLoaded]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (
    product: Product,
    rawQuantity: number | string = 1
  ): { success: boolean; message?: string } => {
    const qty = parseDecimalInput(rawQuantity);
    if (qty <= 0) {
      return { success: false, message: 'Jumlah berat atau kuantitas harus lebih dari 0' };
    }

    const currentItem = cart.find((i) => i.productId === product.id);
    const existingQty = currentItem ? currentItem.quantity : 0;
    const targetQty = Math.round((existingQty + qty) * 1000) / 1000;

    if (targetQty > product.stock) {
      return {
        success: false,
        message: `Stok tidak mencukupi. Sisa stok tersedia: ${product.stock} ${product.unit}`,
      };
    }

    const unitPrice = product.price;
    let updatedCart: CartItem[];

    if (currentItem) {
      updatedCart = cart.map((i) =>
        i.productId === product.id
          ? {
              ...i,
              product,
              quantity: targetQty,
              unitPrice,
              subtotal: calculateItemSubtotal(unitPrice, targetQty),
            }
          : i
      );
    } else {
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity: targetQty,
        unitPrice,
        subtotal: calculateItemSubtotal(unitPrice, targetQty),
      };
      updatedCart = [...cart, newItem];
    }

    setCart(updatedCart);
    saveCart(updatedCart);
    return { success: true };
  };

  const updateQuantity = (
    productId: string,
    rawQuantity: number | string
  ): { success: boolean; message?: string } => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return { success: false, message: 'Item tidak ditemukan di keranjang' };

    const qty = parseDecimalInput(rawQuantity);

    if (qty <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    if (qty > item.product.stock) {
      return {
        success: false,
        message: `Maksimal pembelian adalah sisa stok (${item.product.stock} ${item.product.unit})`,
      };
    }

    const targetQty = Math.round(qty * 1000) / 1000;
    const unitPrice = item.product.price;
    const updatedCart = cart.map((i) =>
      i.productId === productId
        ? {
            ...i,
            quantity: targetQty,
            unitPrice,
            subtotal: calculateItemSubtotal(unitPrice, targetQty),
          }
        : i
    );

    setCart(updatedCart);
    saveCart(updatedCart);
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((i) => i.productId !== productId);
    setCart(updated);
    saveCart(updated);
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };

  const totals = calculateCartTotals(cart, settings.deliveryFee, 'delivery');

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
