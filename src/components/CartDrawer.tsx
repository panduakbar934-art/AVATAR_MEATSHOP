import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { ProductImage } from './ProductImage';
import { WeightSelectionModal } from './WeightSelectionModal';
import { formatIDR, formatWeight } from '../utils/currency';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Edit2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, totals, clearCart } = useCart();
  const navigate = useNavigate();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingQty, setEditingQty] = useState<number>(0.5);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleOpenEdit = (item: (typeof cart)[0]) => {
    setEditingProduct(item.product);
    setEditingQty(item.quantity);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden select-none">
        {/* Backdrop */}
        <div
          onClick={closeCart}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <aside aria-label="Keranjang Belanja" className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slide-left">
            {/* Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#FF3B20]" />
                <h2 className="font-bold text-lg text-[#191919]">Keranjang Belanja</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FF3B20]/10 text-[#FF3B20]">
                  {cart.length} item
                </span>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-stone-400 hover:text-red-600 transition-colors px-2 py-1"
                  >
                    Kosongkan
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
                  aria-label="Tutup keranjang"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Item List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-lg text-[#191919] mb-1">Keranjang masih kosong.</h3>
                  <p className="text-stone-500 text-xs sm:text-sm max-w-xs mb-6">
                    Belum ada potongan daging pilihan yang dimasukkan. Pesan daging segar hari ini!
                  </p>
                  <button
                    onClick={() => {
                      closeCart();
                      navigate('/products');
                    }}
                    className="px-6 py-3 rounded-2xl bg-[#FF3B20] text-white font-black text-xs uppercase tracking-wider hover:bg-[#D92B17] shadow-sm transition-all"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const isKg = item.product.unit === 'kg';
                  return (
                    <div
                      key={item.productId}
                      className="p-4 rounded-3xl border border-stone-200/80 bg-stone-50/60 hover:bg-stone-50 transition-colors space-y-3"
                    >
                      <div className="flex gap-3.5">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-stone-200 flex-shrink-0">
                          <ProductImage
                            image={item.product.image}
                            imageId={item.product.imageId}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-black text-sm text-[#191919] truncate">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                              title="Hapus dari keranjang"
                              aria-label={`Hapus ${item.product.name} dari keranjang`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xs font-bold text-stone-600">
                              {formatIDR(item.unitPrice)}
                            </span>
                            <span className="text-[11px] text-stone-400">/ {item.product.unit}</span>
                          </div>

                          <div className="text-xs font-semibold text-stone-800 mt-1 flex items-center gap-1.5">
                            <span>Berat/Qty: <strong>{formatWeight(item.quantity, item.product.unit)}</strong></span>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="text-[10px] text-[#FF3B20] hover:underline font-bold flex items-center gap-0.5 ml-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Ubah</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Controls & Subtotal */}
                      <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                        {/* Quantity Controller */}
                        <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden p-0.5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - (isKg ? 0.25 : 1))}
                            className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                            aria-label="Kurangi kuantitas"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-14 text-center font-black text-xs text-[#191919]">
                            {formatWeight(item.quantity, item.product.unit)}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + (isKg ? 0.25 : 1))}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-40"
                            aria-label="Tambah kuantitas"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 block uppercase font-semibold">Subtotal</span>
                          <span className="font-black text-sm text-[#FF3B20]">
                            {formatIDR(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Checkout Summary */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-stone-200 bg-stone-50/90 space-y-3.5">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal Produk</span>
                    <span className="font-bold text-stone-900">{formatIDR(totals.subtotal)}</span>
                  </div>
                  {totals.totalWeightKg > 0 && (
                    <div className="flex justify-between text-stone-500">
                      <span>Total Estimasi Berat</span>
                      <span>{formatWeight(totals.totalWeightKg, 'kg')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-500">
                    <span>Biaya Pengantaran</span>
                    <span>Dihitung di checkout</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-stone-500 block">Total Pesanan</span>
                    <span className="text-2xl font-black text-[#191919]">
                      {formatIDR(totals.subtotal)}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">Harga katalog resmi</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="py-3 px-3 rounded-2xl border border-stone-300 hover:bg-white text-stone-800 font-bold text-xs uppercase tracking-wider text-center transition-colors"
                  >
                    Buka Keranjang
                  </Link>

                  <button
                    onClick={handleCheckoutClick}
                    className="py-3 px-4 rounded-2xl bg-[#FF3B20] hover:bg-[#D92B17] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#FF3B20]/25 transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </aside>
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
    </>
  );
};
