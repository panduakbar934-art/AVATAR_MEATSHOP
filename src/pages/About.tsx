import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  ArrowRight,
  Truck,
  HeartHandshake,
  Users,
} from 'lucide-react';

export const About: React.FC = () => {
  const values = [
    {
      title: 'Kesegaran Maksimal',
      desc: 'Setiap potongan diproses dengan cold chain storage 0–4°C untuk menjaga keaslian nutrisi, jus daging, dan tekstur empuk.',
      icon: <Sparkles className="w-5 h-5 text-[#FF3B20]" />,
    },
    {
      title: 'Transparansi & Kejujuran',
      desc: 'Timbangan presisi, tanpa perendaman air berlebih, dan harga transparan baik untuk kebutuhan eceran maupun grosir.',
      icon: <ShieldCheck className="w-5 h-5 text-[#FF3B20]" />,
    },
    {
      title: 'Mitra Bisnis Kuliner',
      desc: 'Mendukung pertumbuhan resto, katering, dan warung makan dengan pasokan stabil, potongan kustom, dan harga grosir kompetitif.',
      icon: <HeartHandshake className="w-5 h-5 text-[#FF3B20]" />,
    },
    {
      title: 'Layanan Responsif & Ramah',
      desc: 'Komunikasi langsung via WhatsApp memudahkan konsultasi potongan, jadwal antar, hingga request khusus pelanggan.',
      icon: <Users className="w-5 h-5 text-[#FF3B20]" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF3B20]/10 text-[#FF3B20] text-xs font-bold uppercase tracking-wider">
          Toko Daging Mentah Segar Harian • Bukan Restoran
        </span>
        <h1
          className="text-4xl sm:text-5xl font-black text-[#191919] tracking-tight"
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          MORE THAN JUST MEAT.
        </h1>
        <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
          Avatar Meatshop adalah toko daging mentah segar pilihan (bukan restoran) yang didedikasikan untuk menyediakan pasokan daging sapi mentah, karkas & fillet ayam harian, jeroan higienis, serta tulang iga bagi rumah tangga maupun mitra usaha kuliner.
        </p>
      </div>

      {/* Story & Image Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5">
          <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
            Cerita Perjalanan Kami
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight leading-snug">
            Dedikasi Menghadirkan Daging Mentah Segar & Higienis Setiap Hari
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Avatar Meatshop beroperasi sebagai butcher shop modern dan sentra toko daging mentah segar. Kami bukan restoran cepat saji atau tempat makan santap di tempat, melainkan toko pemotongan dan penyedia bahan baku daging mentah berkualitas tinggi.
          </p>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Kami memahami bahwa masakan lezat berawal dari bahan baku yang bermutu. Dari ibu rumah tangga yang ingin stok masakan keluarga sehat, pengusaha warung soto & bakso yang butuh tetelan gurih dan tulang iga, hingga usaha katering yang memerlukan suplai fillet ayam dalam jumlah kiloan besar, Avatar Meatshop siap menjadi pemasok terpercaya Anda dengan skema eceran maupun grosir hemat.
          </p>

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF3B20] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#D92B17] transition-all shadow-md shadow-[#FF3B20]/25"
            >
              <span>Jelajahi Produk Kami</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Gallery Showcase */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <div className="rounded-3xl overflow-hidden shadow-lg border border-stone-200">
            <img
              src="https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80"
              alt="Quality Butcher Craft"
              className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg border border-stone-200 mt-6">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
              alt="Fresh Chilled Meat Cuts"
              className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg border border-stone-200">
            <img
              src="https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80"
              alt="Premium Raw Beef"
              className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg border border-stone-200 mt-6">
            <img
              src="https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80"
              alt="Poultry Clean Packaging"
              className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
            Prinsip Kerja Kami
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight mt-1">
            Empat Nilai Utama Avatar Meatshop
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#F7F7F5] border border-stone-200/80 space-y-3 hover:border-stone-300 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                {val.icon}
              </div>
              <h3 className="font-bold text-base text-[#191919]">{val.title}</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
