import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { cleanPhoneNumber } from '../utils/whatsapp';
import {
  ArrowRight,
  MessageCircle,
  ShoppingBag,
  Scale,
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { products, settings } = useStore();
  const phone = cleanPhoneNumber(settings.whatsappNumber || '6281234567890');

  // 4 Core Categories per PRD Revision 02
  const categories = [
    {
      id: 'daging-sapi',
      name: 'Daging Sapi',
      desc: 'Daging sapi segar & tetelan gurih untuk rendang, semur, dan sup.',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
      categoryQuery: 'Daging Sapi',
      count: products.filter((p) => p.category === 'Daging Sapi').length,
    },
    {
      id: 'daging-ayam',
      name: 'Daging Ayam',
      desc: 'Fillet dada dan paha ayam segar tanpa tulang, higienis siap olah.',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
      categoryQuery: 'Daging Ayam',
      count: products.filter((p) => p.category === 'Daging Ayam').length,
    },
    {
      id: 'jeroan',
      name: 'Jeroan',
      desc: 'Babat sapi, ati ampela, dan usus ayam bersih tanpa bau amis.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      categoryQuery: 'Jeroan',
      count: products.filter((p) => p.category.toLowerCase().includes('jeroan')).length,
    },
    {
      id: 'produk-lainnya',
      name: 'Produk Lainnya',
      desc: 'Sayap utuh, ceker bersih, kerongkongan kaldu, & tulang iga sapi.',
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
      categoryQuery: 'Semua',
      count: products.filter(
        (p) =>
          p.category !== 'Daging Sapi' &&
          p.category !== 'Daging Ayam' &&
          !p.category.toLowerCase().includes('jeroan')
      ).length,
    },
  ];

  // 4-8 Featured Products per PRD Revision 02
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  const orderSteps = [
    {
      number: '1',
      title: 'Pilih produk',
      desc: 'Jelajahi pilihan daging sapi mentah, ayam segar harian, atau jeroan higienis.',
      icon: <ShoppingBag className="w-5 h-5 text-[#FF3B20]" />,
    },
    {
      number: '2',
      title: 'Tentukan berat atau jumlah',
      desc: 'Bebas menentukan berat aktual (contoh: 0,25 kg, 0,5 kg, 1,5 kg) tanpa minimal 1 kg.',
      icon: <Scale className="w-5 h-5 text-[#FF3B20]" />,
    },
    {
      number: '3',
      title: 'Masukkan ke keranjang',
      desc: 'Periksa subtotal yang otomatis dihitung transparan sesuai harga katalog.',
      icon: <ShoppingCart className="w-5 h-5 text-[#FF3B20]" />,
    },
    {
      number: '4',
      title: 'Checkout pesanan',
      desc: 'Pilih opsi antar (delivery) atau ambil di toko, lalu konfirmasi pesanan dengan mudah.',
      icon: <CheckCircle2 className="w-5 h-5 text-[#FF3B20]" />,
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 7.2 Simple Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-12 pb-8 sm:pb-16 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-800 text-xs font-bold tracking-wide uppercase shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#FF3B20]"></span>
                <span>Avatar Meatshop • Toko Daging Mentah Segar</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#191919] leading-[1.08]"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Fresh Meat.<br />
                <span className="text-[#FF3B20]">Better Quality.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
                Temukan pilihan daging sapi dan ayam berkualitas untuk memenuhi kebutuhan rumah tangga maupun usaha Anda.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/products"
                  className="px-8 py-4 rounded-2xl bg-[#FF3B20] hover:bg-[#D92B17] text-white font-bold text-sm sm:text-base tracking-wide uppercase shadow-lg shadow-[#FF3B20]/25 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group active:scale-98"
                >
                  <span>Lihat Produk</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href={`https://wa.me/${phone}?text=Halo%20Avatar%20Meatshop,%20saya%20ingin%20tanya%20produk%20daging%20segar`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-stone-800 font-bold text-sm sm:text-base tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-[#FF3B20]" />
                  <span>Hubungi Kami</span>
                </a>
              </div>
            </div>

            {/* Right Visual: Quality Meat Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1000&q=80"
                  alt="Daging Segar Avatar Meatshop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                  <div className="text-xs uppercase tracking-wider font-bold text-amber-300">
                    Pemotongan Harian
                  </div>
                  <div className="text-sm font-black">
                    Daging Sapi & Ayam Segar Pilihan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7.3 Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider block mb-1">
              Kategori Produk
            </span>
            <h2
              className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Pilih Berdasarkan Kategori
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#FF3B20] transition-colors"
          >
            <span>Semua Katalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.categoryQuery)}`}
              className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden hover:border-[#FF3B20]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
                  {cat.count} Produk
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-lg text-[#191919] group-hover:text-[#FF3B20] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 group-hover:text-[#FF3B20]">
                  <span>Lihat Produk</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7.4 Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider block mb-1">
              Produk Pilihan
            </span>
            <h2
              className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Produk Daging Segar Populer
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Dipotong harian dengan kualitas terbaik. Bebas pesan berat berapa saja tanpa minimum 1 kg.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3B20] hover:text-[#D92B17] transition-colors"
          >
            <span>Lihat Semua ({products.length} Produk)</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 7.5 Simple Order Information */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider block mb-1">
              Cara Pemesanan Praktis
            </span>
            <h2
              className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Alur Pemesanan Cepat & Fleksibel
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-2">
              Kemudahan belanja daging segar tanpa repot, transparan, dan fleksibel sesuai kebutuhan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {orderSteps.map((s) => (
              <div
                key={s.number}
                className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center font-black text-sm text-[#FF3B20]">
                      {s.number}
                    </span>
                    <div className="p-2 rounded-lg bg-white border border-stone-200/70">
                      {s.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-[#191919] mb-2">
                    {s.title}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7.6 Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#191919] to-stone-900 text-white p-8 sm:p-12 shadow-xl border border-stone-800">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FF3B20]/20 text-[#FF3B20] text-xs font-bold uppercase tracking-wider">
              Avatar Meatshop Melayani Anda
            </span>
            <h2
              className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Need Fresh Meat Today?
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Daging sapi dan ayam segar dipotong setiap hari dalam kondisi higienis dan suhu dingin terjaga. Pesan sekarang untuk kebutuhan hari ini!
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/products"
                className="px-7 py-3.5 rounded-xl bg-[#FF3B20] hover:bg-[#D92B17] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF3B20]/30 transition-all text-center"
              >
                Belanja Sekarang
              </Link>
              <a
                href={`https://wa.me/${phone}?text=Halo%20Avatar%20Meatshop,%20saya%20ingin%20pesan%20daging%20segar`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Hubungi WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
