import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import {
  Search,
  Grid,
  List,
  X,
  RotateCcw,
} from 'lucide-react';

export const Products: React.FC = () => {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const initialCategory = searchParams.get('category') || 'Semua';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync when search params change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  const categories: string[] = [
    'Semua',
    'Daging Sapi',
    'Daging Ayam',
    'Produk Ayam',
    'Jeroan Ayam',
    'Jeroan Sapi',
    'Tulang Sapi',
  ];

  const clearAllFilters = () => {
    setSelectedCategory('Semua');
    setSearchQuery('');
    setStockFilter('all');
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== 'Semua' ||
    searchQuery.trim() !== '' ||
    stockFilter !== 'all' ||
    sortBy !== 'featured';

  // Filtered and sorted products using single catalog price
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Active check
        if (!p.isActive) return false;

        // Category filter
        if (selectedCategory !== 'Semua') {
          if (selectedCategory === 'Jeroan') {
            if (!p.category.toLowerCase().includes('jeroan')) return false;
          } else if (p.category !== selectedCategory) {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Stock filter
        if (stockFilter === 'in-stock' && p.stock <= 0) return false;
        if (stockFilter === 'low-stock' && (p.stock <= 0 || p.stock > 10)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0; // default order
      });
  }, [products, selectedCategory, searchQuery, stockFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xs">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
            Katalog Toko Daging Mentah Segar
          </span>
          <h1
            className="text-3xl sm:text-4xl font-black text-[#191919] tracking-tight mt-1"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Pilihan Daging Sapi, Ayam, & Jeroan Segar
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2 leading-relaxed">
            Temukan aneka potongan daging sapi mentah segar harian, bagian ayam potong bersih, jeroan higienis, serta tulang iga dengan jaminan harga katalog transparan dan kebebasan pesan berat berapa saja (tanpa minimal 1 kg).
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-stone-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                if (cat === 'Semua') {
                  searchParams.delete('category');
                } else {
                  searchParams.set('category', cat);
                }
                setSearchParams(searchParams);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#FF3B20] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari potongan daging, sirloin, ayam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              aria-label="Hapus kata pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls: Stock, Sort, View */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Stock filter select */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#FF3B20]"
          >
            <option value="all">Semua Ketersediaan</option>
            <option value="in-stock">Tersedia Saja</option>
            <option value="low-stock">Stok Menipis (≤ 10)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#FF3B20]"
          >
            <option value="featured">Urutan: Rekomendasi</option>
            <option value="price-asc">Harga: Termurah</option>
            <option value="price-desc">Harga: Tertinggi</option>
            <option value="name-asc">Nama Produk (A-Z)</option>
          </select>

          {/* Grid / List switch */}
          <div className="hidden sm:flex items-center border border-stone-200 rounded-xl p-0.5 bg-stone-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-[#FF3B20] shadow-xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              aria-label="Tampilan Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#FF3B20] shadow-xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              aria-label="Tampilan List"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips & Reset */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div>
          Menampilkan <strong className="text-stone-900">{filteredProducts.length}</strong> produk
          {selectedCategory !== 'Semua' && ` di kategori "${selectedCategory}"`}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-[#FF3B20] hover:text-[#D92B17] font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua Filter</span>
          </button>
        )}
      </div>

      {/* Product Results */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#191919]">Produk Tidak Ditemukan</h3>
          <p className="text-stone-500 text-xs sm:text-sm">
            Tidak ada produk yang sesuai dengan kriteria filter atau pencarian Anda. Coba kata kunci lain atau reset filter.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2.5 rounded-xl bg-[#FF3B20] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D92B17] transition-all cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} layout="list" />
          ))}
        </div>
      )}
    </div>
  );
};
