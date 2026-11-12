import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../components/Toast';
import { Product, ProductCategory } from '../../types';
import { formatIDR, formatNumber, formatWeight } from '../../utils/currency';
import { exportProductsToCSV } from '../../utils/csvHandler';
import { saveImage, getImage, deleteImage, validateImage, createImagePreview } from '../../utils/imageStorage';
import { ProductImage } from '../../components/ProductImage';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const initialForm = {
    name: '',
    category: 'Daging Sapi' as ProductCategory,
    description: '',
    price: 120000,
    unit: 'kg' as 'kg' | 'pcs',
    stock: 25.0,
    cost_price: 90000,
    image: '',
    imageId: null as string | null,
    isActive: true,
    badge: '',
  };

  const [form, setForm] = useState(initialForm);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load preview when opening edit
  useEffect(() => {
    let active = true;
    if (form.imageId) {
      getImage(form.imageId).then((url) => {
        if (active && url) {
          setImagePreviewUrl(url);
        }
      });
    } else if (form.image) {
      setImagePreviewUrl(form.image);
    } else {
      setImagePreviewUrl(null);
    }

    return () => {
      active = false;
    };
  }, [form.imageId, form.image]);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setImagePreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      unit: p.unit,
      stock: p.stock,
      cost_price: p.cost_price || 0,
      image: p.image,
      imageId: p.imageId || null,
      isActive: p.isActive,
      badge: p.badge || '',
    });
    setImagePreviewUrl(p.image || null);
    setIsModalOpen(true);
  };

  const handleFileSelected = async (file: File) => {
    const validation = validateImage(file);
    if (!validation.isValid) {
      showToast(validation.error || 'File gambar tidak valid.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const generatedId = await saveImage(file);
      const preview = createImagePreview(file);
      setImagePreviewUrl(preview);
      setForm((prev) => ({
        ...prev,
        imageId: generatedId,
        image: preview, // fallback data url
      }));
      showToast('Foto produk berhasil disimpan di penyimpanan lokal.', 'success');
    } catch (err) {
      console.error('Failed to save image:', err);
      showToast('Gagal memproses gambar.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (form.imageId) {
      deleteImage(form.imageId).catch(() => {});
    }
    setForm((prev) => ({
      ...prev,
      imageId: null,
      image: '',
    }));
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (p: Product) => {
    if (window.confirm(`Yakin ingin menghapus produk "${p.name}"?`)) {
      if (p.imageId) {
        deleteImage(p.imageId).catch(() => {});
      }
      deleteProduct(p.id);
      showToast(`Produk ${p.name} berhasil dihapus.`, 'info');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Nama produk wajib diisi.', 'error');
      return;
    }

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Harga katalog harus berupa angka lebih dari 0.', 'error');
      return;
    }

    const stockNum = Number(form.stock);
    if (isNaN(stockNum) || stockNum < 0) {
      showToast('Stok tidak boleh bernilai negatif.', 'error');
      return;
    }

    const defaultFallbackImg =
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: priceNum,
        unit: form.unit,
        stock: stockNum,
        cost_price: Number(form.cost_price) || 0,
        image: form.image || defaultFallbackImg,
        imageId: form.imageId,
        isActive: form.isActive,
        badge: form.badge ? form.badge : undefined,
      });
      showToast(`Produk "${form.name}" berhasil diperbarui.`, 'success');
    } else {
      addProduct({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || `${form.name} segar pilihan Avatar Meatshop`,
        price: priceNum,
        unit: form.unit,
        stock: stockNum,
        cost_price: Number(form.cost_price) || 0,
        image: form.image || defaultFallbackImg,
        imageId: form.imageId,
        isActive: form.isActive,
        badge: form.badge ? form.badge : undefined,
      });
      showToast(`Produk baru "${form.name}" berhasil ditambahkan.`, 'success');
    }

    setIsModalOpen(false);
  };

  // Filtered list
  const filtered = products.filter((p) => {
    if (selectedCategory !== 'Semua' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
            Katalog & Master Data
          </span>
          <h1
            className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight mt-0.5"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Manajemen Produk
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Kelola satu harga katalog transparan dan stok desimal aktual setiap produk.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportProductsToCSV(products)}
            className="px-4 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 bg-white text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-[#FF3B20] hover:bg-[#D92B17] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#FF3B20]/25 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari nama produk atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs pl-9 focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 focus:ring-2 focus:ring-[#FF3B20]"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Daging Sapi">Daging Sapi</option>
            <option value="Daging Ayam">Daging Ayam</option>
            <option value="Produk Ayam">Produk Ayam</option>
            <option value="Jeroan Ayam">Jeroan Ayam</option>
            <option value="Jeroan Sapi">Jeroan Sapi</option>
            <option value="Tulang Sapi">Tulang Sapi</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga Katalog</th>
                <th className="py-3.5 px-4 text-right">Harga Modal</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                        <ProductImage
                          image={p.image}
                          imageId={p.imageId}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{p.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-600">{p.category}</td>
                  <td className="py-3 px-4 text-right font-black text-stone-900">
                    {formatIDR(p.price)}
                    <span className="text-[10px] text-stone-400 font-normal ml-0.5">/{p.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-stone-500">
                    {formatIDR(p.cost_price || 0)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        p.stock <= 0
                          ? 'bg-red-50 text-red-600'
                          : p.stock <= 10
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {formatWeight(p.stock, p.unit)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {p.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Produk"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal with Image Dropzone */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-bold text-lg text-[#191919]">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Daging Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Image Upload Dropzone */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  Foto Produk (IndexedDB Local Storage)
                </label>
                
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                    isDragging
                      ? 'border-[#FF3B20] bg-[#FF3B20]/5'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  {imagePreviewUrl ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200 bg-white">
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-stone-800 block">
                            Foto siap digunakan
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {form.imageId ? 'Tersimpan di IndexedDB' : 'Menggunakan URL/Default'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                        >
                          Ganti Foto
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                          title="Hapus Foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-stone-200/70 text-stone-500 flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-bold text-[#FF3B20] hover:underline cursor-pointer"
                        >
                          Klik untuk unggah foto
                        </button>
                        <span className="text-xs text-stone-500"> atau seret gambar ke sini</span>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        Format didukung: JPG, PNG, WEBP (Maksimal 3MB)
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1.5">
                  <Info className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span>Gambar DEMO tersimpan secara lokal pada perangkat ini (IndexedDB).</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Nama Produk <span className="text-[#FF3B20]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Contoh: Daging Sapi Gandik Rendang"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                  >
                    <option value="Daging Sapi">Daging Sapi</option>
                    <option value="Daging Ayam">Daging Ayam</option>
                    <option value="Produk Ayam">Produk Ayam</option>
                    <option value="Jeroan Ayam">Jeroan Ayam</option>
                    <option value="Jeroan Sapi">Jeroan Sapi</option>
                    <option value="Tulang Sapi">Tulang Sapi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Satuan</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value as 'kg' | 'pcs' })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="pcs">pcs (Satuan/Potong)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Harga Katalog (Rp) <span className="text-[#FF3B20]">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    min={0}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Harga Modal / Beli (Cost Price)
                  </label>
                  <input
                    type="number"
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: Number(e.target.value) })}
                    min={0}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Stok Tersedia (Desimal diizinkan, misal: 25.5)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    min={0}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Badge Produk</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                  >
                    <option value="">Tanpa Badge</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Popular">Popular</option>
                    <option value="Fresh Stock">Fresh Stock</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#FF3B20]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-xl bg-[#FF3B20] text-white text-xs font-bold hover:bg-[#D92B17] shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
