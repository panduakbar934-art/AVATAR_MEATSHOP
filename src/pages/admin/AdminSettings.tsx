import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../components/Toast';
import { StoreSettings } from '../../types';
import { formatIDR } from '../../utils/currency';
import {
  Settings,
  Store,
  Phone,
  MapPin,
  Clock,
  Truck,
  RotateCcw,
  Save,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetDemo } = useStore();
  const { showToast } = useToast();

  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: form.storeName.trim(),
      whatsappNumber: form.whatsappNumber.trim(),
      storeAddress: form.storeAddress.trim(),
      operationalHours: form.operationalHours.trim(),
      deliveryFee: Number(form.deliveryFee) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 15,
    });
    showToast('Pengaturan toko berhasil disimpan ke penyimpanan lokal.', 'success');
  };

  const handleConfirmReset = () => {
    resetDemo();
    setForm(settings);
    setIsResetConfirmOpen(false);
    showToast('Seluruh data demo toko dan inventaris berhasil dikembalikan ke awal.', 'info');
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
          Konfigurasi Sistem
        </span>
        <h1
          className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight mt-0.5"
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          Pengaturan Toko & Preferensi
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1">
          Pengaturan ini disimpan di LocalStorage dan langsung memengaruhi perhitungan checkout serta link WhatsApp.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-4">
          <h2 className="font-bold text-base text-[#191919] pb-2 border-b border-stone-100 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#FF3B20]" />
            <span>Identitas & Kontak Toko</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Nama Toko / Brand
              </label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Nomor WhatsApp Toko
              </label>
              <input
                type="tel"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
              />
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Format nomor: 628123456789 (tanpa spasi)
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Alamat Fisik Toko
              </label>
              <textarea
                rows={2}
                value={form.storeAddress}
                onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Jam Operasional
              </label>
              <input
                type="text"
                value={form.operationalHours}
                onChange={(e) => setForm({ ...form, operationalHours: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h2 className="font-bold text-base text-[#191919] pb-2 border-b border-stone-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#FF3B20]" />
            <span>Biaya Pengantaran & Ambang Batas</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Biaya Pengantaran Kurir (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.deliveryFee}
                onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
              />
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Diterapkan jika memilih metode Delivery
              </span>
            </div>



            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Ambang Batas Stok Kritis
              </label>
              <input
                type="number"
                min={1}
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
              />
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Memicu notifikasi Low Stock
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#FF3B20] hover:bg-[#D92B17] text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Demo Reset */}
      <div className="bg-red-50/50 rounded-3xl border border-red-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-base text-red-900">Zona Reset Demo Data</h3>
        </div>
        <p className="text-xs text-red-700 leading-relaxed">
          Tombol ini akan menghapus semua produk tambahan, perubahan stok, dan riwayat pesanan yang Anda buat di browser ini, kemudian mengembalikannya ke kondisi demo default Avatar Meatshop.
        </p>

        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Semua Data Demo ke Awal</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-stone-900">Konfirmasi Reset Data Demo</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Seluruh transaksi pesanan baru, catatan barang masuk/keluar, dan produk yang telah diedit akan dikembalikan ke data awal.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
