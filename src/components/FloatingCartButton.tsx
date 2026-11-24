import React from 'react';
import { useCart } from '../context/CartContext';
import { formatIDR, formatWeight } from '../utils/currency';
import { ShoppingBag, ChevronRight, X } from 'lucide-react';

export const FloatingCartButton: React.FC = () => {
  const { cart, totals, openCart, isCartOpen } = useCart();

  // Hanya tampil jika ada produk di keranjang dan drawer keranjang sedang tidak terbuka penuh
  if (cart.length === 0 || isCartOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 select-none animate-bounce-subtle">
      <button
        onClick={openCart}
        aria-label="Lihat Keranjang Belanja"
        className="group flex items-center gap-3 bg-gradient-to-r from-[#FF6B00] to-[#FF3B20] text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-95 transition-all duration-300 border border-white/20"
      >
        {/* Icon & Badge */}
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:rotate-6 transition-transform">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-white text-[#FF5400] font-black text-xs rounded-full flex items-center justify-center shadow-md">
            {cart.length}
          </span>
        </div>

        {/* Info Keranjang */}
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">
              {cart.length} Item
            </span>
            {totals.totalWeightKg > 0 && (
              <span className="text-[10px] bg-black/20 text-white/95 px-1.5 py-0.5 rounded-md font-semibold">
                {formatWeight(totals.totalWeightKg, 'kg')}
              </span>
            )}
          </div>
          <div className="font-black text-sm text-white tracking-tight leading-none mt-0.5">
            {formatIDR(totals.subtotal)}
          </div>
        </div>

        {/* Action arrow */}
        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform ml-1">
          <ChevronRight className="w-4 h-4 text-white" />
        </div>
      </button>
    </div>
  );
};
