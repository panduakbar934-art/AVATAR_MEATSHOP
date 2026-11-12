import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { ProductImage } from './ProductImage';
import {
  formatIDR,
  formatWeight,
  formatWeightGrams,
  parseDecimalInput,
  calculateItemSubtotal,
  validateStock,
} from '../utils/currency';
import { X, Plus, Minus, ShoppingBag, Check, AlertCircle } from 'lucide-react';

interface WeightSelectionModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialQuantity?: number;
  mode?: 'add' | 'edit';
  onSaved?: () => void;
}

export const WeightSelectionModal: React.FC<WeightSelectionModalProps> = ({
  product,
  isOpen,
  onClose,
  initialQuantity = 0.5,
  mode = 'add',
  onSaved,
}) => {
  const { addToCart, updateQuantity } = useCart();
  const { showToast } = useToast();

  const isKg = product?.unit === 'kg';
  const defaultInitial = isKg ? (initialQuantity > 0 ? initialQuantity : 0.5) : Math.max(1, Math.round(initialQuantity));

  const [inputVal, setInputVal] = useState<string>(String(defaultInitial).replace('.', ','));

  useEffect(() => {
    if (product) {
      const init = isKg ? (initialQuantity > 0 ? initialQuantity : 0.5) : Math.max(1, Math.round(initialQuantity));
      setInputVal(String(init).replace('.', ','));
    }
  }, [product, initialQuantity, isKg]);

  const parsedQty = useMemo(() => {
    return parseDecimalInput(inputVal);
  }, [inputVal]);

  if (!isOpen || !product) return null;

  const pricePerUnit = product.price;
  const subtotal = calculateItemSubtotal(pricePerUnit, parsedQty);
  const stockValidation = validateStock(parsedQty, product.stock, product.unit);
  const isOutOfStock = product.stock <= 0;

  const handleStep = (delta: number) => {
    const current = parseDecimalInput(inputVal);
    let next: number;
    if (isKg) {
      // Step by 0.25 kg
      next = Math.max(0.1, Math.round((current + delta) * 100) / 100);
    } else {
      next = Math.max(1, Math.round(current + delta));
    }
    if (next > product.stock) {
      next = product.stock;
    }
    setInputVal(String(next).replace('.', ','));
  };

  const handlePreset = (val: number) => {
    const safeVal = Math.min(val, product.stock);
    setInputVal(String(safeVal).replace('.', ','));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockValidation.isValid) {
      showToast(stockValidation.message || 'Kuantitas tidak valid.', 'error');
      return;
    }

    if (mode === 'edit') {
      const res = updateQuantity(product.id, parsedQty);
      if (res.success) {
        showToast(`Pesanan ${product.name} diperbarui menjadi ${formatWeight(parsedQty, product.unit)}.`, 'success');
        if (onSaved) onSaved();
        onClose();
      } else {
        showToast(res.message || 'Gagal memperbarui keranjang.', 'error');
      }
    } else {
      const res = addToCart(product, parsedQty);
      if (res.success) {
        showToast(`${product.name} ${formatWeight(parsedQty, product.unit)} berhasil ditambahkan.`, 'success');
        if (onSaved) onSaved();
        onClose();
      } else {
        showToast(res.message || 'Gagal menambahkan ke keranjang.', 'error');
      }
    }
  };

  const kgPresets = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full overflow-hidden shadow-2xl space-y-0 animate-scale-in">
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-stone-50 border-b border-stone-200/80 flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-stone-200 flex-shrink-0 shadow-xs">
            <ProductImage
              image={product.image}
              imageId={product.imageId}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 pr-6">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-stone-200/70 text-[10px] font-bold text-stone-700 uppercase tracking-wide mb-1">
              {product.category}
            </div>
            <h3 className="font-black text-lg text-[#191919] leading-snug">
              {product.name}
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-base font-black text-[#FF3B20]">
                {formatIDR(product.price)}
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                / {product.unit}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Weight Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Stock availability banner */}
          <div className="flex items-center justify-between text-xs py-2 px-3.5 rounded-xl bg-stone-100/80 text-stone-700">
            <span>Stok Fisik Tersedia:</span>
            <span className={`font-bold ${product.stock <= 5 ? 'text-[#FF3B20]' : 'text-stone-900'}`}>
              {formatWeight(product.stock, product.unit)}
            </span>
          </div>

          {/* Weight / Quantity Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800">
              {isKg ? 'Berapa berat yang ingin dibeli?' : 'Berapa jumlah yang ingin dibeli?'}
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStep(isKg ? -0.25 : -1)}
                disabled={isOutOfStock}
                className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-black flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50"
                aria-label="Kurangi kuantitas"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={isKg ? 'Contoh: 0,5' : '1'}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={isOutOfStock}
                  autoFocus
                  className="w-full text-center font-black text-xl bg-stone-50 border border-stone-300 rounded-2xl py-2.5 px-4 focus:ring-2 focus:ring-[#FF3B20] focus:bg-white text-stone-900"
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-stone-400 uppercase">
                  {product.unit}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleStep(isKg ? 0.25 : 1)}
                disabled={isOutOfStock}
                className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-black flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50"
                aria-label="Tambah kuantitas"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Validation warning */}
            {!stockValidation.isValid && inputVal.trim() !== '' && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold pt-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{stockValidation.message}</span>
              </div>
            )}
          </div>

          {/* Quick preset chips for kg */}
          {isKg && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500 block">
                Pilihan Cepat (Kg):
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {kgPresets.map((val) => {
                  const label = String(val).replace('.', ',');
                  const isSelected = Math.abs(parsedQty - val) < 0.001;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePreset(val)}
                      disabled={val > product.stock}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#FF3B20] text-white border-[#FF3B20] shadow-xs'
                          : val > product.stock
                          ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      {label} kg
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Real-time Calculation Summary Box (REVISION 04) */}
          <div className="rounded-2xl p-4 bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span>Harga per {product.unit}:</span>
              <span className="font-semibold text-stone-900">{formatIDR(pricePerUnit)}</span>
            </div>
            <div className="flex items-center justify-between text-stone-500">
              <span>Berat/Jumlah pilihan:</span>
              <span className="font-bold text-stone-900">{formatWeight(parsedQty, product.unit)}</span>
            </div>
            {isKg && (
              <div className="flex items-center justify-between text-stone-500">
                <span>Estimasi timbangan:</span>
                <span className="font-semibold text-stone-700">{formatWeightGrams(parsedQty)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm">
              <span className="font-bold text-stone-900">Total Harga:</span>
              <span className="font-black text-lg text-[#FF3B20]">{formatIDR(subtotal)}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!stockValidation.isValid || isOutOfStock}
              className="w-full py-4 rounded-2xl bg-[#FF3B20] hover:bg-[#D92B17] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#FF3B20]/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {mode === 'edit' ? 'Simpan Perubahan' : 'Tambah ke Keranjang'} • {formatIDR(subtotal)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
