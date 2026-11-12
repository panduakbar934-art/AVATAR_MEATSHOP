import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatIDR, formatWeight } from '../utils/currency';
import { ProductImage } from './ProductImage';
import { WeightSelectionModal } from './WeightSelectionModal';
import { ShoppingBag, Eye, Scale } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleOpenWeightModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWeightModalOpen(true);
  };

  if (layout === 'list') {
    return (
      <>
        <div className="group bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 hover:border-stone-300 hover:shadow-xl transition-all duration-300">
          <Link
            to={`/products/${product.id}`}
            className="relative w-full sm:w-48 h-40 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0"
          >
            <ProductImage
              image={product.image}
              imageId={product.imageId}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {product.isFeatured && (
              <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-bold text-white bg-[#FF3B20] rounded-full shadow-xs uppercase tracking-wider">
                Pilihan
              </span>
            )}
          </Link>

          <div className="flex-1 flex flex-col justify-between w-full space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {product.category}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
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

              <Link to={`/products/${product.id}`}>
                <h3 className="font-black text-lg text-[#191919] group-hover:text-[#FF3B20] transition-colors leading-snug">
                  {product.name}
                </h3>
              </Link>

              <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 mt-1 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-stone-400 block uppercase">
                  Harga Katalog
                </span>
                <div className="text-xl font-black text-[#191919]">
                  {formatIDR(product.price)}
                  <span className="text-xs font-medium text-stone-500 ml-1">/ {product.unit}</span>
                </div>
                {product.unit === 'kg' && (
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    Bebas pesan berat berapa saja (misal: 0,25 kg, 0,5 kg)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/products/${product.id}`}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail</span>
                </Link>
                <button
                  onClick={handleOpenWeightModal}
                  disabled={isOutOfStock}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
                    isOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-[#FF3B20] hover:bg-[#D92B17] text-white hover:shadow-md active:scale-98'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Pilih Produk</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Selection Modal */}
        <WeightSelectionModal
          product={product}
          isOpen={isWeightModalOpen}
          onClose={() => setIsWeightModalOpen(false)}
        />
      </>
    );
  }

  // Grid Layout
  return (
    <>
      <div className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden flex flex-col justify-between hover:border-stone-300 hover:shadow-xl transition-all duration-300">
        {/* Product Image */}
        <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] bg-stone-100 overflow-hidden">
          <ProductImage
            image={product.image}
            imageId={product.imageId}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 text-[10px] font-bold text-white bg-[#FF3B20] rounded-full shadow-xs uppercase tracking-wider">
                Pilihan
              </span>
            </div>
          )}

          {/* Stock status pill */}
          <div className="absolute bottom-2.5 right-2.5">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs backdrop-blur-sm ${
                isOutOfStock
                  ? 'bg-red-600/90 text-white'
                  : isLowStock
                  ? 'bg-amber-600/90 text-white'
                  : 'bg-black/60 text-white'
              }`}
            >
              {isOutOfStock ? 'Stok Habis' : `Tersedia: ${formatWeight(product.stock, product.unit)}`}
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              {product.category}
            </span>
            <Link to={`/products/${product.id}`}>
              <h3 className="font-black text-base sm:text-lg text-[#191919] group-hover:text-[#FF3B20] transition-colors line-clamp-1 leading-snug">
                {product.name}
              </h3>
            </Link>
            <p className="text-stone-500 text-xs line-clamp-2 mt-1.5 mb-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Action */}
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-stone-400 block uppercase">
                Harga Katalog
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-[#191919]">
                  {formatIDR(product.price)}
                </span>
                <span className="text-xs text-stone-500 font-semibold">
                  / {product.unit}
                </span>
              </div>
              {product.unit === 'kg' && (
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Bisa beli berapa saja (misal: 0,5 kg)
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                to={`/products/${product.id}`}
                className="py-2.5 px-3 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                aria-label={`Lihat detail ${product.name}`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Detail</span>
              </Link>
              <button
                onClick={handleOpenWeightModal}
                disabled={isOutOfStock}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  isOutOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-[#FF3B20] hover:bg-[#D92B17] text-white hover:shadow-md active:scale-98'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Pilih Produk</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Selection Modal */}
      <WeightSelectionModal
        product={product}
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />
    </>
  );
};
