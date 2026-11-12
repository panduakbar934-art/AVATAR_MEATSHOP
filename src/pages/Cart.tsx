import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { ProductImage } from '../components/ProductImage';
import { WeightSelectionModal } from '../components/WeightSelectionModal';
import { formatIDR, formatWeight } from '../utils/currency';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  Edit2,
  Scale,
} from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totals } = useCart();
  const navigate = useNavigate();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingQty, setEditingQty] = useState<number>(0.5);

  const handleOpenEdit = (item: (typeof cart)[0]) => {
    setEditingProduct(item.product);
    setEditingQty(item.quantity);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-14 shadow-xs max-w-lg mx-auto space-y-5">
          <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-[#191919]">Keranjang masih kosong.</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Anda belum menambahkan potongan daging segar ke keranjang belanja. Jelajahi katalog kami untuk memilih potongan daging sapi, ayam segar harian, jeroan, dan tulang iga.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#FF3B20] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#D92B17] transition-all shadow-md shadow-[#FF3B20]/25 active:scale-95"
            >
              <span>Mulai Belanja</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#FF3B20] mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Lanjut Belanja Daging</span>
          </Link>
          <h1
            className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans' }}
          >
            Keranjang Belanja ({cart.length} item)
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-stone-400 hover:text-red-600 transition-colors self-start sm:self-auto"
        >
          Kosongkan Keranjang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items Table / Cards */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const isKg = item.product.unit === 'kg';
            return (
              <div
                key={item.productId}
                className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5 justify-between"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                    <ProductImage
                      image={item.product.image}
                      imageId={item.product.imageId}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      {item.product.category}
                    </span>
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-black text-base text-[#191919] hover:text-[#FF3B20] transition-colors"
                    >
                      {item.product.name}
                    </Link>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-black text-[#191919]">
                        {formatIDR(item.unitPrice)}
                      </span>
                      <span className="text-xs text-stone-400">/ {item.product.unit}</span>
                    </div>

                    <div className="text-xs font-semibold text-stone-800 mt-1 flex items-center gap-1.5">
                      <span>Berat: <strong>{formatWeight(item.quantity, item.product.unit)}</strong></span>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-[11px] text-[#FF3B20] hover:underline font-bold flex items-center gap-0.5 ml-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Berat</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Controls and subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-stone-100">
                  <div className="flex items-center border border-stone-300 rounded-2xl bg-stone-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - (isKg ? 0.25 : 1))}
                      className="p-1.5 rounded-xl bg-white text-stone-700 hover:bg-stone-100 transition-colors shadow-xs"
                      aria-label="Kurangi kuantitas"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-16 text-center font-black text-xs text-[#191919]">
                      {formatWeight(item.quantity, item.product.unit)}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + (isKg ? 0.25 : 1))}
                      disabled={item.quantity >= item.product.stock}
                      className="p-1.5 rounded-xl bg-white text-stone-700 hover:bg-stone-100 transition-colors shadow-xs disabled:opacity-40"
                      aria-label="Tambah kuantitas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[110px]">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total Item</span>
                    <span className="text-base font-black text-[#191919]">
                      {formatIDR(item.subtotal)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    title="Hapus"
                    aria-label={`Hapus ${item.product.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-5">
            <h2 className="font-bold text-lg text-[#191919] pb-3 border-b border-stone-100">
              Ringkasan Pesanan
            </h2>

            <div className="space-y-2.5 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-bold text-stone-900">{formatIDR(totals.subtotal)}</span>
              </div>
              {totals.totalWeightKg > 0 && (
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Total Estimasi Berat</span>
                  <span className="font-semibold text-stone-800">{formatWeight(totals.totalWeightKg, 'kg')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-stone-500">
                <span>Biaya Pengantaran</span>
                <span>Dihitung di checkout</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-stone-800">Total Pesanan</span>
              <span className="text-2xl font-black text-[#191919]">
                {formatIDR(totals.subtotal)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-[#FF3B20] hover:bg-[#D92B17] text-white font-black text-sm uppercase tracking-wider shadow-md shadow-[#FF3B20]/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Lanjutkan ke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Guarantee Pill */}
          <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200 text-xs text-stone-600 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Dipotong segar dan dikemas higienis dengan ice pack untuk menjaga mutu selama perjalanan.</span>
          </div>
        </div>
      </div>

      {/* Edit Weight Modal */}
      <WeightSelectionModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        initialQuantity={editingQty}
        mode="edit"
      />
    </div>
  );
};
