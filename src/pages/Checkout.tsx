import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/Toast';
import { formatIDR, formatWeight } from '../utils/currency';
import { calculateCartTotals } from '../utils/pricing';
import { FulfillmentMethod, PaymentMethod, OrderItem } from '../types';
import {
  Truck,
  Store,
  QrCode,
  Banknote,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { settings, createOrder } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#191919]">Keranjang Anda Kosong</h2>
        <p className="text-stone-500 text-sm">
          Silakan pilih produk daging terlebih dahulu sebelum menuju halaman pembayaran.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF3B20] text-white font-bold text-xs uppercase"
        >
          <span>Pilih Produk</span>
        </Link>
      </div>
    );
  }

  const totals = calculateCartTotals(cart, settings.deliveryFee, fulfillmentMethod);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) {
      errs.customerName = 'Nama lengkap wajib diisi.';
    }
    if (!customerPhone.trim()) {
      errs.customerPhone = 'Nomor WhatsApp wajib diisi.';
    } else if (customerPhone.trim().length < 9) {
      errs.customerPhone = 'Nomor WhatsApp tidak valid (minimal 9 digit).';
    }
    if (fulfillmentMethod === 'delivery' && !customerAddress.trim()) {
      errs.customerAddress = 'Alamat pengantaran wajib diisi untuk metode Delivery.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Mohon lengkapi data form yang diperlukan.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build order items with single catalog price and exact decimal weight
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      }));

      const newOrder = createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress:
          fulfillmentMethod === 'delivery'
            ? customerAddress.trim()
            : `Pickup di Toko: ${settings.storeAddress}`,
        orderNotes: orderNotes.trim() || undefined,
        fulfillmentMethod,
        deliveryFee: totals.appliedDeliveryFee,
        paymentMethod,
        paymentStatus: paymentMethod === 'qris' ? 'Lunas' : 'Belum Dibayar',
        orderStatus: 'Menunggu Konfirmasi',
        items: orderItems,
        subtotal: totals.subtotal,
        total: totals.grandTotal,
      });

      // Clear cart
      clearCart();
      showToast('Pesanan berhasil dibuat!', 'success');

      // Navigate to order success
      navigate(`/order-success/${newOrder.id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      showToast('Terjadi kesalahan saat memproses pesanan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#FF3B20] mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Keranjang</span>
        </Link>
        <h1
          className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight"
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          Checkout & Pembayaran
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1">
          Lengkapi data pemesanan daging segar Anda. Pembayaran dan konfirmasi dapat dilakukan dengan aman.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Details, Fulfillment, Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer Info */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="font-bold text-base text-[#191919] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF3B20] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Informasi Pelanggan</span>
            </h2>

            <div className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nama Lengkap / Nama Bisnis <span className="text-[#FF3B20]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso / Resto Berkah"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white transition-all ${
                    errors.customerName ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                  }`}
                />
                {errors.customerName && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.customerName}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nomor WhatsApp Aktif <span className="text-[#FF3B20]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white transition-all ${
                    errors.customerPhone ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                  }`}
                />
                {errors.customerPhone && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.customerPhone}</span>
                )}
                <span className="text-[11px] text-stone-400 block mt-1">
                  Nomor ini akan digunakan untuk mengirimkan rincian pesanan dan resi pengantaran.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Fulfillment Method */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="font-bold text-base text-[#191919] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF3B20] text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Metode Pemenuhan Pesanan</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-[#FF3B20] bg-[#FF3B20]/5'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="delivery"
                  checked={fulfillmentMethod === 'delivery'}
                  onChange={() => setFulfillmentMethod('delivery')}
                  className="mt-1 text-[#FF3B20] focus:ring-[#FF3B20]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#191919]">
                    <Truck className="w-4 h-4 text-[#FF3B20]" />
                    <span>Delivery (Kurir / Ojek)</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Diantar langsung ke alamat Anda dengan pendingin es batu.
                  </div>
                  <div className="text-xs font-bold text-[#FF3B20] mt-1.5">
                    Ongkir: {formatIDR(settings.deliveryFee)}
                  </div>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-[#FF3B20] bg-[#FF3B20]/5'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="pickup"
                  checked={fulfillmentMethod === 'pickup'}
                  onChange={() => setFulfillmentMethod('pickup')}
                  className="mt-1 text-[#FF3B20] focus:ring-[#FF3B20]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#191919]">
                    <Store className="w-4 h-4 text-[#FF3B20]" />
                    <span>Ambil di Toko (Pickup)</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Ambil langsung di toko Avatar Meatshop sesuai jam operasional.
                  </div>
                  <div className="text-xs font-bold text-emerald-700 mt-1.5">
                    Gratis (Rp 0)
                  </div>
                </div>
              </label>
            </div>

            {/* Address field for delivery */}
            {fulfillmentMethod === 'delivery' ? (
              <div className="pt-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Alamat Lengkap Pengantaran <span className="text-[#FF3B20]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan nama jalan, nomor rumah, patokan, RT/RW, dan kelurahan..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white transition-all ${
                    errors.customerAddress ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                  }`}
                />
                {errors.customerAddress && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.customerAddress}</span>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
                <Store className="w-4 h-4 text-[#FF3B20] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Lokasi Toko Avatar Meatshop:</strong>
                  <span>{settings.storeAddress}</span>
                  <div className="text-stone-500 mt-0.5">Jam buka: {settings.operationalHours}</div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Catatan Khusus Pesanan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Potong ketebalan 2cm / Pisahkan plastik per 1kg"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
              />
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="font-bold text-base text-[#191919] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FF3B20] text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Metode Pembayaran (Simulasi DEMO)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'cod'
                    ? 'border-[#FF3B20] bg-[#FF3B20]/5'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-[#FF3B20] focus:ring-[#FF3B20]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#191919]">
                    <Banknote className="w-4 h-4 text-[#FF3B20]" />
                    <span>COD (Bayar di Tempat)</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Bayar tunai atau transfer saat daging sampai di tempat atau diambil.
                  </div>
                  <span className="inline-block mt-2 text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-semibold">
                    Status: Belum Dibayar
                  </span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'qris'
                    ? 'border-[#FF3B20] bg-[#FF3B20]/5'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="qris"
                  checked={paymentMethod === 'qris'}
                  onChange={() => setPaymentMethod('qris')}
                  className="mt-1 text-[#FF3B20] focus:ring-[#FF3B20]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#191919]">
                    <QrCode className="w-4 h-4 text-[#FF3B20]" />
                    <span>QRIS (Simulasi Demo)</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Simulasi bayar instan via QRIS tanpa potongan biaya admin.
                  </div>
                  <span className="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    Status: Simulasi Lunas
                  </span>
                </div>
              </label>
            </div>

            {/* QRIS Demo Card Preview */}
            {paymentMethod === 'qris' && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-24 h-24 bg-white p-2 rounded-xl border border-stone-300 shadow-xs flex-shrink-0 flex items-center justify-center">
                  {/* Decorative QR code graphic */}
                  <svg className="w-full h-full text-stone-800" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 2h2v4h-2v-4zm2 2h2v2h-2v-2zm-6-2h2v2h-2v-2z" />
                  </svg>
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  <div className="font-bold text-stone-900 flex items-center justify-center sm:justify-start gap-1">
                    <span>QRIS AVATAR MEATSHOP DEMO</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold">Simulasi</span>
                  </div>
                  <p>
                    Ini adalah simulasi QRIS frontend. Setelah menekan tombol konfirmasi, status pembayaran pesanan Anda akan otomatis diset Lunas (Demo).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary Sticky Card */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-5">
            <h2 className="font-bold text-base text-[#191919] pb-3 border-b border-stone-100">
              Rincian Tagihan ({cart.length} Produk)
            </h2>

            {/* Items list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-2">
                  <div className="flex-1 truncate">
                    <div className="font-bold text-stone-800 truncate">{item.product.name}</div>
                    <div className="text-stone-400">
                      {formatWeight(item.quantity, item.product.unit)} × {formatIDR(item.unitPrice)}
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">
                    {formatIDR(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotals & Delivery fee */}
            <div className="space-y-2 text-xs pt-3 border-t border-stone-100 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-bold text-stone-900">{formatIDR(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Biaya Pengantaran ({fulfillmentMethod === 'delivery' ? 'Kurir Lokal' : 'Pickup'})
                </span>
                <span className="font-bold text-stone-900">
                  {totals.appliedDeliveryFee > 0
                    ? formatIDR(totals.appliedDeliveryFee)
                    : 'Gratis (Rp 0)'}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-stone-400 block font-semibold uppercase">Total Pembayaran</span>
                <span className="text-2xl font-black text-[#191919]">
                  {formatIDR(totals.grandTotal)}
                </span>
              </div>
              <span className="text-xs text-[#FF3B20] font-bold">
                {paymentMethod === 'cod' ? 'COD' : 'QRIS'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#FF3B20] hover:bg-[#D92B17] disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wider shadow-md shadow-[#FF3B20]/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{isSubmitting ? 'Memproses Pesanan...' : 'Konfirmasi Pesanan Sekarang'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stok toko akan otomatis diperbarui setelah pemesanan.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
