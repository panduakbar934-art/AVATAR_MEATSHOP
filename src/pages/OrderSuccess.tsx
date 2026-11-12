import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatIDR, formatWeight } from '../utils/currency';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import {
  CheckCircle2,
  MessageSquare,
  Home,
  ShoppingBag,
  Truck,
  Store,
  Calendar,
  CreditCard,
  PackageCheck,
  Sparkles,
} from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, settings } = useStore();

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#191919]">Pesanan Tidak Ditemukan</h2>
        <p className="text-stone-500 text-sm">
          Pesanan dengan nomor tersebut tidak ditemukan pada penyimpanan lokal browser Anda.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF3B20] text-white font-bold text-xs uppercase"
        >
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  const waUrl = generateWhatsAppOrderUrl(settings.whatsappNumber, order);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Success Hero Badge */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 shadow-lg text-center space-y-4 relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Pesanan Berhasil Dicatat!
          </span>
          <h1
            className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans' }}
          >
            Terima Kasih, {order.customerName}!
          </h1>
          <p className="text-stone-500 text-sm max-w-md mx-auto mt-2 leading-relaxed">
            Pesanan Anda telah masuk ke sistem simulasi toko. Silakan konfirmasikan pesanan langsung ke WhatsApp kami untuk proses penyiapan potongan daging.
          </p>
        </div>

        {/* Order ID Pill */}
        <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-stone-200 max-w-sm mx-auto flex items-center justify-between">
          <span className="text-xs text-stone-500 uppercase font-semibold">Nomor Pesanan:</span>
          <span className="text-base font-black text-[#FF3B20] tracking-wider select-all">
            {order.id}
          </span>
        </div>

        {/* WhatsApp Big CTA Button */}
        <div className="pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#25D366]/30 transition-all hover:scale-102 active:scale-98"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Kirim Detail Pesanan ke WhatsApp Toko</span>
          </a>
        </div>
      </div>

      {/* Order Details Breakdown Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="font-bold text-lg text-[#191919] pb-3 border-b border-stone-100 flex items-center justify-between">
          <span>Rincian Pesanan #{order.id}</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {order.orderStatus}
          </span>
        </h2>

        {/* Meta details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
          <div>
            <span className="text-stone-400 block mb-0.5">Pemesan:</span>
            <span className="font-bold text-stone-900">{order.customerName}</span> ({order.customerPhone})
          </div>
          <div>
            <span className="text-stone-400 block mb-0.5">Waktu Pemesanan:</span>
            <span className="font-semibold text-stone-900">
              {new Date(order.createdAt).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block mb-0.5">Metode Pengambilan:</span>
            <span className="font-bold text-stone-900 capitalize">
              {order.fulfillmentMethod === 'delivery' ? 'Pengantaran Kurir (Delivery)' : 'Ambil di Toko (Pickup)'}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block mb-0.5">Metode Pembayaran:</span>
            <span className="font-bold text-stone-900 uppercase">
              {order.paymentMethod === 'cod' ? 'COD (Bayar di Tempat)' : 'QRIS (Simulasi Demo)'}
            </span>
            <span
              className={`ml-1.5 px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                order.paymentStatus === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
          {order.customerAddress && (
            <div className="sm:col-span-2 pt-2 border-t border-stone-200/60">
              <span className="text-stone-400 block mb-0.5">Alamat / Lokasi Pengambilan:</span>
              <span className="font-medium text-stone-800">{order.customerAddress}</span>
            </div>
          )}
          {order.orderNotes && (
            <div className="sm:col-span-2 pt-2 border-t border-stone-200/60">
              <span className="text-stone-400 block mb-0.5">Catatan Khusus:</span>
              <span className="font-medium text-stone-800 italic">{order.orderNotes}</span>
            </div>
          )}
        </div>

        {/* Ordered items table */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
            Daftar Produk Daging
          </h3>
          <div className="divide-y divide-stone-100 border border-stone-100 rounded-2xl overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <div className="font-bold text-stone-900">{item.productName || (item as any).name}</div>
                  <div className="text-stone-400 text-xs mt-0.5">
                    {formatWeight(item.quantity, item.unit)} × {formatIDR(item.unitPrice)}
                  </div>
                </div>
                <div className="font-bold text-stone-900">{formatIDR(item.subtotal)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill summary totals */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal Produk</span>
            <span className="font-bold text-stone-900">{formatIDR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Biaya Pengantaran</span>
            <span className="font-bold text-stone-900">
              {order.deliveryFee > 0 ? formatIDR(order.deliveryFee) : 'Gratis (Rp 0)'}
            </span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-black text-base text-[#191919]">
            <span>Total Pembayaran</span>
            <span className="text-xl text-[#FF3B20]">{formatIDR(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Navigation actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#191919] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Belanja Produk Lainnya</span>
        </Link>
      </div>
    </div>
  );
};
