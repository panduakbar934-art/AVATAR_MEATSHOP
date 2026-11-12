import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { ProductImage } from '../components/ProductImage';
import { ProductCard } from '../components/ProductCard';
import {
  formatIDR,
  formatWeight,
  formatWeightGrams,
  parseDecimalInput,
  calculateItemSubtotal,
  validateStock,
} from '../utils/currency';
import { generateWhatsAppProductInquiry } from '../utils/whatsapp';
import {
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Plus,
  Minus,
  ChevronLeft,
  Thermometer,
  Package,
  ShieldCheck,
  Scale,
  AlertCircle,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, settings } = useStore();
  const { addToCart, openCart } = useCart();
  const { showToast } = useToast();

  const product = products.find((p) => p.id === id);

  const isKg = product?.unit === 'kg';
  const [weightInput, setWeightInput] = useState<string>(isKg ? '0,5' : '1');

  const parsedQty = useMemo(() => {
    return parseDecimalInput(weightInput);
  }, [weightInput]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#191919]">Produk Tidak Ditemukan</h2>
        <p className="text-stone-500 text-sm">
          Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF3B20] text-white font-bold text-xs uppercase"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const pricePerUnit = product.price;
  const subtotal = calculateItemSubtotal(pricePerUnit, parsedQty);
  const stockValidation = validateStock(parsedQty, product.stock, product.unit);

  const handleStep = (delta: number) => {
    const current = parseDecimalInput(weightInput);
    let next: number;
    if (isKg) {
      next = Math.max(0.1, Math.round((current + delta) * 100) / 100);
    } else {
      next = Math.max(1, Math.round(current + delta));
    }
    if (next > product.stock) {
      next = product.stock;
    }
    setWeightInput(String(next).replace('.', ','));
  };

  const handlePreset = (val: number) => {
    const safeVal = Math.min(val, product.stock);
    setWeightInput(String(safeVal).replace('.', ','));
  };

  const handleAddToCart = () => {
    if (!stockValidation.isValid) {
      showToast(stockValidation.message || 'Kuantitas tidak valid', 'error');
      return;
    }

    const res = addToCart(product, parsedQty);
    if (res.success) {
      showToast(
        `${product.name} ${formatWeight(parsedQty, product.unit)} berhasil ditambahkan.`,
        'success'
      );
      openCart();
    } else {
      showToast(res.message || 'Gagal menambahkan ke keranjang', 'error');
    }
  };

  const handleBuyNow = () => {
    if (!stockValidation.isValid) {
      showToast(stockValidation.message || 'Kuantitas tidak valid', 'error');
      return;
    }

    const res = addToCart(product, parsedQty);
    if (res.success) {
      navigate('/cart');
    } else {
      showToast(res.message || 'Gagal melanjutkan pesanan', 'error');
    }
  };

  const waInquiryUrl = generateWhatsAppProductInquiry(
    settings.whatsappNumber,
    product.name,
    parsedQty,
    false
  );

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const kgPresets = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-[#FF3B20] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Kembali ke Katalog Produk</span>
      </Link>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Image Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 aspect-[4/3] shadow-md">
            <ProductImage
              image={product.image}
              imageId={product.imageId}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.isFeatured && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[#FF3B20] text-white text-xs font-bold shadow-md uppercase tracking-wider">
                Produk Pilihan
              </span>
            )}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-medium">
              Foto Produk Asli Avatar Meatshop
            </div>
          </div>

          {/* Value props under image */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-white rounded-2xl border border-stone-200/70 text-center space-y-1">
              <Thermometer className="w-4 h-4 text-[#FF3B20] mx-auto" />
              <div className="text-[11px] font-bold text-stone-800">Suhu Terkontrol</div>
              <div className="text-[10px] text-stone-500">Chilled 0–4°C</div>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-stone-200/70 text-center space-y-1">
              <Package className="w-4 h-4 text-[#FF3B20] mx-auto" />
              <div className="text-[11px] font-bold text-stone-800">Kemasan Higienis</div>
              <div className="text-[10px] text-stone-500">Food Grade Rapi</div>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-stone-200/70 text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-[#FF3B20] mx-auto" />
              <div className="text-[11px] font-bold text-stone-800">Potongan Presisi</div>
              <div className="text-[10px] text-stone-500">Butcher Segar</div>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Single Catalog Weight Calculator */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs font-medium text-stone-500">SKU: {product.id}</span>
            </div>

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#191919] tracking-tight leading-snug"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {product.name}
            </h1>

            <p className="text-stone-600 text-sm sm:text-base mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Single Catalog Price Box */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-5">
            <div className="flex items-baseline justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Harga Katalog Transparan
                </span>
                <div className="text-3xl font-black text-[#191919] mt-0.5">
                  {formatIDR(product.price)}
                  <span className="text-sm font-semibold text-stone-500 ml-1.5">
                    / {product.unit}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold text-stone-400 block uppercase">
                  Status Ketersediaan
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                    isOutOfStock
                      ? 'bg-red-50 text-red-600'
                      : isLowStock
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isOutOfStock ? 'Stok Habis' : `Tersedia: ${formatWeight(product.stock, product.unit)}`}
                </span>
              </div>
            </div>

            {/* REVISION 04: Weight Input Field */}
            <div className="space-y-3">
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
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    disabled={isOutOfStock}
                    className="w-full text-center font-black text-2xl bg-stone-50 border border-stone-300 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#FF3B20] focus:bg-white text-stone-900"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-stone-400 uppercase">
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

              {!stockValidation.isValid && weightInput.trim() !== '' && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{stockValidation.message}</span>
                </div>
              )}
            </div>

            {/* Quick Presets for kg */}
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
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
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
                <span className="font-black text-xl text-[#FF3B20]">{formatIDR(subtotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!stockValidation.isValid || isOutOfStock}
                  className="py-4 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tambah Keranjang</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!stockValidation.isValid || isOutOfStock}
                  className="py-4 px-4 rounded-2xl bg-[#FF3B20] hover:bg-[#D92B17] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[#FF3B20]/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Lihat Keranjang & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* WhatsApp seller inquiry */}
              <a
                href={waInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl border border-stone-300 hover:border-[#25D366] hover:bg-[#25D366]/5 text-stone-700 hover:text-emerald-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-center"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Konsultasi Potongan Khusus via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Specifications Table */}
          {product.specifications && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-[#191919] uppercase tracking-wider">
                Spesifikasi & Informasi Potongan
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                {product.specifications.cut && (
                  <div>
                    <span className="text-stone-400 block">Bagian / Potongan</span>
                    <span className="font-semibold text-stone-800">{product.specifications.cut}</span>
                  </div>
                )}
                {product.specifications.storage && (
                  <div>
                    <span className="text-stone-400 block">Suhu Penyimpanan</span>
                    <span className="font-semibold text-stone-800">{product.specifications.storage}</span>
                  </div>
                )}
                {product.specifications.packaging && (
                  <div>
                    <span className="text-stone-400 block">Kemasan</span>
                    <span className="font-semibold text-stone-800">{product.specifications.packaging}</span>
                  </div>
                )}
                {product.specifications.origin && (
                  <div>
                    <span className="text-stone-400 block">Karakter</span>
                    <span className="font-semibold text-stone-800">{product.specifications.origin}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[#191919] tracking-tight">
              Produk Terkait di Kategori {product.category}
            </h2>
            <Link
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-xs font-bold text-[#FF3B20] hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
