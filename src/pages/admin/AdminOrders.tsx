import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../components/Toast';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatIDR, formatWeight } from '../../utils/currency';
import { generateAdminOrderContactUrl } from '../../utils/whatsapp';
import { exportOrdersToCSV } from '../../utils/csvHandler';
import {
  ClipboardList,
  Search,
  Download,
  Eye,
  MessageCircle,
  X,
  AlertCircle,
  CheckCircle2,
  Truck,
  Store,
  RotateCcw,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, updatePaymentStatus, cancelOrder } = useStore();
  const { showToast } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const statusOptions: OrderStatus[] = [
    'Menunggu Konfirmasi',
    'Diproses',
    'Siap Diambil',
    'Dalam Pengantaran',
    'Selesai',
    'Dibatalkan',
  ];

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'Dibatalkan') {
      if (
        window.confirm(
          'Apakah Anda yakin ingin membatalkan pesanan ini? Stok produk akan otomatis dikembalikan ke inventaris.'
        )
      ) {
        cancelOrder(orderId, 'Dibatalkan oleh Admin');
        showToast('Pesanan dibatalkan dan stok telah dikembalikan ke inventaris.', 'info');
      }
      return;
    }

    updateOrderStatus(orderId, newStatus);
    showToast(`Status pesanan ${orderId} diubah menjadi "${newStatus}".`, 'success');
  };

  const handlePaymentStatusChange = (orderId: string, newPaymentStatus: PaymentStatus) => {
    updatePaymentStatus(orderId, newPaymentStatus);
    showToast(`Status pembayaran pesanan ${orderId} diubah menjadi "${newPaymentStatus}".`, 'success');
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'Semua' && o.orderStatus !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
            Transaksi Pelanggan
          </span>
          <h1
            className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight mt-0.5"
            style={{ fontFamily: 'Plus Jakarta Sans' }}
          >
            Kelola Pesanan ({orders.length})
          </h1>
        </div>

        <button
          onClick={() => exportOrdersToCSV(orders)}
          className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-stone-500" />
          <span>Ekspor Pesanan (.CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cari ID pesanan, nama, no WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs pl-9 focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['Semua', ...statusOptions].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-[#191919] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">No. Pesanan</th>
                <th className="py-3 px-4 font-bold">Pelanggan</th>
                <th className="py-3 px-4 font-bold">Tanggal</th>
                <th className="py-3 px-4 font-bold">Metode</th>
                <th className="py-3 px-4 font-bold text-right">Total Tagihan</th>
                <th className="py-3 px-4 font-bold text-center">Status Pesanan</th>
                <th className="py-3 px-4 font-bold text-center">Pembayaran</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const contactUrl = generateAdminOrderContactUrl(order);
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="font-mono font-bold text-[#FF3B20] hover:underline"
                        >
                          {order.id}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{order.customerName}</div>
                        <div className="text-[10px] text-stone-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-stone-700 font-medium">
                          {order.fulfillmentMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900">
                        {formatIDR(order.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition-colors ${
                            order.orderStatus === 'Selesai'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.orderStatus === 'Dibatalkan'
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handlePaymentStatusChange(order.id, e.target.value as PaymentStatus)
                          }
                          className={`text-[10px] font-bold rounded-lg px-2 py-1 border ${
                            order.paymentStatus === 'Lunas'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <option value="Belum Dibayar">Belum Dibayar</option>
                          <option value="Lunas">Lunas</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                            title="Lihat Detail Pesanan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={contactUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            title="Hubungi Pelanggan via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF3B20] tracking-wider block">
                  Detail Transaksi
                </span>
                <h2 className="font-bold text-lg text-[#191919]">{viewingOrder.id}</h2>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-400">Pemesan:</span>
                  <span className="font-bold text-stone-900">{viewingOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">No. WhatsApp:</span>
                  <span className="font-semibold text-stone-900">{viewingOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Metode Pengambilan:</span>
                  <span className="font-semibold text-stone-900 capitalize">
                    {viewingOrder.fulfillmentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Metode Pembayaran:</span>
                  <span className="font-semibold text-stone-900 uppercase">
                    {viewingOrder.paymentMethod} ({viewingOrder.paymentStatus})
                  </span>
                </div>
                {viewingOrder.customerAddress && (
                  <div className="pt-1.5 border-t border-stone-200/60">
                    <span className="text-stone-400 block mb-0.5">Alamat:</span>
                    <span className="font-medium text-stone-800">{viewingOrder.customerAddress}</span>
                  </div>
                )}
                {viewingOrder.orderNotes && (
                  <div className="pt-1.5 border-t border-stone-200/60">
                    <span className="text-stone-400 block mb-0.5">Catatan:</span>
                    <span className="italic text-stone-700">{viewingOrder.orderNotes}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold text-[11px] text-stone-500 uppercase tracking-wider">
                  Item Produk:
                </span>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                  {viewingOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-stone-900">{it.productName || (it as any).name}</div>
                        <div className="text-[10px] text-stone-400">
                          {formatWeight(it.quantity, it.unit)} × {formatIDR(it.unitPrice)}
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">{formatIDR(it.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span>{formatIDR(viewingOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Ongkir:</span>
                  <span>{formatIDR(viewingOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#191919] pt-1 border-t border-stone-200">
                  <span>Total Tagihan:</span>
                  <span className="text-[#FF3B20]">{formatIDR(viewingOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
              <a
                href={generateAdminOrderContactUrl(viewingOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Kirim Update WA</span>
              </a>

              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
