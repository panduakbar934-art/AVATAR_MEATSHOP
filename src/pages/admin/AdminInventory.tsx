import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../components/Toast';
import { formatIDR, formatNumber } from '../../utils/currency';
import {
  exportInventoryToCSV,
  exportMovementsToCSV,
  validateAndPreviewCSV,
  CSVRowPreview,
} from '../../utils/csvHandler';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { products, movements, recordBarangMasuk, recordBarangKeluar, importProductsFromCSV } =
    useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'status' | 'history' | 'csv'>('status');

  // Modals
  const [isMasukModalOpen, setIsMasukModalOpen] = useState(false);
  const [isKeluarModalOpen, setIsKeluarModalOpen] = useState(false);

  // Forms
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [inflowQty, setInflowQty] = useState<number>(10);
  const [inflowCostPrice, setInflowCostPrice] = useState<number>(0);
  const [inflowNotes, setInflowNotes] = useState('');

  const [outflowQty, setOutflowQty] = useState<number>(5);
  const [outflowNotes, setOutflowNotes] = useState('Sampel masak / susut');

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaderError, setCsvHeaderError] = useState<string | null>(null);
  const [csvPreviews, setCsvPreviews] = useState<CSVRowPreview[]>([]);

  // Search in inventory
  const [searchQuery, setSearchQuery] = useState('');

  // Total inventory valuation
  const totalValuation = products.reduce((acc, p) => acc + p.stock * (p.cost_price || 0), 0);

  const openMasukModal = (pId?: string) => {
    const target = pId || products[0]?.id || '';
    setSelectedProductId(target);
    const prod = products.find((p) => p.id === target);
    setInflowCostPrice(prod?.cost_price || 0);
    setInflowQty(10);
    setInflowNotes('Restok pasokan daging segar baru');
    setIsMasukModalOpen(true);
  };

  const handleMasukSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || inflowQty <= 0) {
      showToast('Mohon pilih produk dan kuantitas valid.', 'error');
      return;
    }
    recordBarangMasuk(selectedProductId, Number(inflowQty), Number(inflowCostPrice), inflowNotes);
    showToast('Pencatatan Barang Masuk berhasil disimpan.', 'success');
    setIsMasukModalOpen(false);
  };

  const openKeluarModal = (pId?: string) => {
    const target = pId || products[0]?.id || '';
    setSelectedProductId(target);
    setOutflowQty(1);
    setOutflowNotes('Susut timbangan / sampel potong');
    setIsKeluarModalOpen(true);
  };

  const handleKeluarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (outflowQty <= 0) {
      showToast('Kuantitas keluar harus lebih dari 0.', 'error');
      return;
    }
    if (outflowQty > prod.stock) {
      showToast(`Stok tidak mencukupi (sisa ${prod.stock} ${prod.unit}).`, 'error');
      return;
    }

    recordBarangKeluar(selectedProductId, Number(outflowQty), outflowNotes);
    showToast('Pencatatan Barang Keluar berhasil disimpan.', 'info');
    setIsKeluarModalOpen(false);
  };

  // CSV File Handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvHeaderError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const result = validateAndPreviewCSV(text);
      if (!result.isValidHeader) {
        setCsvHeaderError(result.headerError || 'Format header CSV tidak valid');
        setCsvPreviews([]);
      } else {
        setCsvHeaderError(null);
        setCsvPreviews(result.previews);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmCSVImport = () => {
    const validItems = csvPreviews.filter((p) => p.isValid && p.product).map((p) => p.product!);
    if (validItems.length === 0) {
      showToast('Tidak ada data baris yang valid untuk diimpor.', 'error');
      return;
    }

    const { added, updated } = importProductsFromCSV(validItems);
    showToast(
      `Impor CSV sukses: ${added} produk baru ditambahkan, ${updated} produk diperbarui.`,
      'success'
    );
    setCsvFile(null);
    setCsvPreviews([]);
    setActiveTab('status');
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
            Sistem Inventaris Lokal
          </span>
          <h1
            className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight mt-0.5"
            style={{ fontFamily: 'Plus Jakarta Sans' }}
          >
            Inventaris & Manajemen Stok
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openMasukModal()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>+ Barang Masuk</span>
          </button>
          <button
            onClick={() => openKeluarModal()}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-black text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>- Barang Keluar</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-stone-400 text-xs uppercase font-bold tracking-wider block">
            Total Nilai Persediaan
          </span>
          <div className="text-2xl font-black text-[#191919] mt-1">
            {formatIDR(totalValuation)}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">Rumus: Stok Fisik × Harga Beli</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-stone-400 text-xs uppercase font-bold tracking-wider block">
            Total Pergerakan Stok
          </span>
          <div className="text-2xl font-black text-[#191919] mt-1">
            {movements.length} Log
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">Masuk, keluar, & otomatis penjualan</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-stone-400 text-xs uppercase font-bold tracking-wider block">
            Stok Kritis / Habis
          </span>
          <div className="text-2xl font-black text-[#FF3B20] mt-1">
            {products.filter((p) => p.stock <= 10).length} Produk
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">Perlu perhatian restok</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-stone-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('status')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'status'
              ? 'text-[#FF3B20] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF3B20]'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Status Stok & Nilai Persediaan</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'history'
              ? 'text-[#FF3B20] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF3B20]'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Inventaris ({movements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('csv')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'csv'
              ? 'text-[#FF3B20] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF3B20]'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Impor & Ekspor CSV</span>
        </button>
      </div>

      {/* TAB 1: STATUS INVENTARIS */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Cari produk di stok..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-xs pl-9 focus:ring-2 focus:ring-[#FF3B20]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={() => exportInventoryToCSV(products)}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Unduh Laporan Stok (.CSV)</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">Produk</th>
                    <th className="py-3 px-4 font-bold">Kategori</th>
                    <th className="py-3 px-4 font-bold text-right">Stok Tersedia</th>
                    <th className="py-3 px-4 font-bold text-right">Harga Beli (Cost)</th>
                    <th className="py-3 px-4 font-bold text-right">Nilai Persediaan</th>
                    <th className="py-3 px-4 font-bold text-center">Status Stok</th>
                    <th className="py-3 px-4 font-bold text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((p) => {
                    const invVal = p.stock * (p.cost_price || 0);
                    const isOut = p.stock <= 0;
                    const isLow = p.stock > 0 && p.stock <= 10;
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{p.name}</div>
                          <div className="text-[10px] text-stone-400">ID: {p.id}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-600">{p.category}</td>
                        <td className="py-3 px-4 text-right font-black text-stone-900 text-sm">
                          {formatNumber(p.stock)} {p.unit}
                        </td>
                        <td className="py-3 px-4 text-right text-stone-600 font-semibold">
                          {formatIDR(p.cost_price)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-stone-900">
                          {formatIDR(invVal)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isOut
                                ? 'bg-red-100 text-red-700'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openMasukModal(p.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] transition-colors"
                            >
                              + Masuk
                            </button>
                            <button
                              onClick={() => openKeluarModal(p.id)}
                              className="px-2 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-bold text-[10px] transition-colors"
                            >
                              - Keluar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT INVENTARIS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Audit log setiap perubahan stok: barang masuk, keluar, penjualan transaksi, dan pembatalan pesanan.
            </p>
            <button
              onClick={() => exportMovementsToCSV(movements)}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Ekspor Riwayat (.CSV)</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">Waktu</th>
                    <th className="py-3 px-4 font-bold">Tipe Mutasi</th>
                    <th className="py-3 px-4 font-bold">Produk</th>
                    <th className="py-3 px-4 font-bold text-right">Jumlah</th>
                    <th className="py-3 px-4 font-bold">Keterangan / Referensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 text-stone-500">
                        {new Date(m.date).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.type === 'Masuk'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.type === 'Keluar'
                              ? 'bg-stone-200 text-stone-800'
                              : m.type === 'Pembatalan'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">{m.productName}</td>
                      <td
                        className={`py-3 px-4 text-right font-black ${
                          m.type === 'Masuk' || m.type === 'Pembatalan'
                            ? 'text-emerald-600'
                            : 'text-[#FF3B20]'
                        }`}
                      >
                        {m.type === 'Masuk' || m.type === 'Pembatalan' ? '+' : '-'}
                        {m.quantity}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{m.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CSV IMPORT & EXPORT */}
      {activeTab === 'csv' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import Box */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#FF3B20]" />
                <h3 className="font-bold text-base text-[#191919]">Impor Produk & Stok via CSV</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Unggah file CSV dengan header:
                <code className="bg-stone-100 text-stone-800 px-1 py-0.5 rounded block mt-1 font-mono text-[10px]">
                  product_id,name,category,retail_price,wholesale_price,minimum_wholesale,unit,stock,cost_price
                </code>
              </p>

              <div className="pt-2">
                <label className="block w-full border-2 border-dashed border-stone-300 hover:border-[#FF3B20] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-stone-50">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                  <FileSpreadsheet className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-stone-800 block">
                    {csvFile ? csvFile.name : 'Pilih file CSV dari komputer'}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Format file .csv (UTF-8)
                  </span>
                </label>
              </div>

              {csvHeaderError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{csvHeaderError}</span>
                </div>
              )}
            </div>

            {/* Export Center Box */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-[#191919]">Pusat Ekspor Laporan CSV</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Unduh snapshot data toko kapan saja ke file spreadsheet UTF-8:
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => exportInventoryToCSV(products)}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors flex items-center justify-between"
                >
                  <span>1. Ekspor Status Stok & Nilai Inventaris</span>
                  <Download className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <button
                  onClick={() => exportMovementsToCSV(movements)}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors flex items-center justify-between"
                >
                  <span>2. Ekspor Log Mutasi Barang Masuk & Keluar</span>
                  <Download className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>
            </div>
          </div>

          {/* CSV Preview Section */}
          {csvPreviews.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#191919]">
                    Pratinjau Impor CSV ({csvPreviews.length} Baris)
                  </h3>
                  <p className="text-xs text-stone-400">
                    Pastikan data valid sebelum menekan tombol konfirmasi impor.
                  </p>
                </div>

                <button
                  onClick={handleConfirmCSVImport}
                  className="px-6 py-2.5 rounded-xl bg-[#FF3B20] hover:bg-[#D92B17] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Konfirmasi & Simpan Impor
                </button>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-2xl max-h-80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 sticky top-0 border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Product ID</th>
                      <th className="py-2.5 px-3">Nama</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-right">Eceran</th>
                      <th className="py-2.5 px-3 text-right">Grosir</th>
                      <th className="py-2.5 px-3 text-right">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {csvPreviews.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'bg-white' : 'bg-red-50/40'}>
                        <td className="py-2.5 px-3">
                          {row.isValid ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> {row.errors[0]}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{row.raw.product_id}</td>
                        <td className="py-2.5 px-3 font-bold">{row.raw.name}</td>
                        <td className="py-2.5 px-3">{row.raw.category}</td>
                        <td className="py-2.5 px-3 text-right">{row.raw.retail_price}</td>
                        <td className="py-2.5 px-3 text-right">{row.raw.wholesale_price}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{row.raw.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Barang Masuk */}
      {isMasukModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-bold text-base text-[#191919] flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                <span>Pencatatan Barang Masuk</span>
              </h2>
              <button
                onClick={() => setIsMasukModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMasukSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Pilih Produk Daging</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setInflowCostPrice(p.cost_price || 0);
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok Saat Ini: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Jumlah Masuk</label>
                <input
                  type="number"
                  min={1}
                  value={inflowQty}
                  onChange={(e) => setInflowQty(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Harga Beli / Cost per Satuan (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={inflowCostPrice}
                  onChange={(e) => setInflowCostPrice(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Catatan / Supplier</label>
                <input
                  type="text"
                  value={inflowNotes}
                  onChange={(e) => setInflowNotes(e.target.value)}
                  placeholder="Contoh: Penerimaan RPH Pagi"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsMasukModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Simpan Barang Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Barang Keluar */}
      {isKeluarModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-bold text-base text-[#191919] flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#FF3B20]" />
                <span>Pencatatan Barang Keluar / Rusak</span>
              </h2>
              <button
                onClick={() => setIsKeluarModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleKeluarSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Pilih Produk</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Tersedia: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Jumlah Keluar</label>
                <input
                  type="number"
                  min={1}
                  value={outflowQty}
                  onChange={(e) => setOutflowQty(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Keterangan / Alasan</label>
                <input
                  type="text"
                  value={outflowNotes}
                  onChange={(e) => setOutflowNotes(e.target.value)}
                  placeholder="Contoh: Susut trimming / sampel tes masak"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsKeluarModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF3B20] text-white font-bold hover:bg-[#D92B17]"
                >
                  Simpan Barang Keluar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
