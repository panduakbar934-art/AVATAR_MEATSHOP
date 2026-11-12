import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { useStore } from '../context/StoreContext';
import { cleanPhoneNumber } from '../utils/whatsapp';
import { Phone, MapPin, Clock, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, isAdmin } = useStore();
  const phone = cleanPhoneNumber(settings.whatsappNumber || '6281234567890');

  return (
    <footer className="bg-[#191919] text-white pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="light" size="lg" />
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm mt-3">
              Avatar Meatshop adalah toko daging mentah segar harian pilihan (bukan restoran), melayani penjualan daging sapi mentah, ayam segar, jeroan higienis, dan tulang iga siap masak untuk rumah tangga maupun mitra usaha kuliner.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800/80 text-xs text-stone-300 border border-stone-700">
                <ShieldCheck className="w-4 h-4 text-[#FF3B20]" />
                <span>Kualitas Higienis & Potongan Presisi</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/" className="hover:text-[#FF3B20] transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#FF3B20] transition-colors">
                  Katalog Produk
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#FF3B20] transition-colors">
                  Daging Segar Harian
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#FF3B20] transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#FF3B20] transition-colors">
                  Kontak & Lokasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Kategori Daging
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/products?category=Daging Sapi" className="hover:text-[#FF3B20] transition-colors">
                  Daging & Tetelan Sapi
                </Link>
              </li>
              <li>
                <Link to="/products?category=Daging Ayam" className="hover:text-[#FF3B20] transition-colors">
                  Fillet Dada & Paha Ayam
                </Link>
              </li>
              <li>
                <Link to="/products?category=Produk Ayam" className="hover:text-[#FF3B20] transition-colors">
                  Sayap, Ceker, & Potongan Ayam
                </Link>
              </li>
              <li>
                <Link to="/products?category=Jeroan Ayam" className="hover:text-[#FF3B20] transition-colors">
                  Ati Ampela & Usus Ayam
                </Link>
              </li>
              <li>
                <Link to="/products?category=Jeroan Sapi" className="hover:text-[#FF3B20] transition-colors">
                  Babat Sapi Bersih
                </Link>
              </li>
              <li>
                <Link to="/products?category=Tulang Sapi" className="hover:text-[#FF3B20] transition-colors">
                  Tulang Iga Sapi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Store Info */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Toko & Kontak
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF3B20] flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{settings.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#FF3B20] flex-shrink-0" />
                <span>{settings.operationalHours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF3B20] flex-shrink-0" />
                <a
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FF3B20] transition-colors flex items-center gap-1 text-white font-semibold"
                >
                  <span>{settings.whatsappNumber}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            &copy; {new Date().getFullYear()} Avatar Meatshop. All rights reserved. Fresh Meat, Better Quality.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-stone-300 transition-colors">
              Kebijakan Mutu
            </Link>
            <Link to="/contact" className="hover:text-stone-300 transition-colors">
              Bantuan
            </Link>
            <Link
              to={isAdmin ? '/admin' : '/admin/login'}
              className="text-stone-400 hover:text-[#FF3B20] transition-colors font-medium flex items-center gap-1"
            >
              <span>{isAdmin ? 'Dashboard Admin' : 'Admin Demo'}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
