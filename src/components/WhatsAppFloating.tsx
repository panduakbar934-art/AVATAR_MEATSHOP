import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { cleanPhoneNumber } from '../utils/whatsapp';
import { MessageSquare, X } from 'lucide-react';

export const WhatsAppFloating: React.FC = () => {
  const { settings } = useStore();
  const [showTooltip, setShowTooltip] = useState(true);

  const phone = cleanPhoneNumber(settings.whatsappNumber || '6281234567890');
  const greeting = encodeURIComponent(
    'Halo Avatar Meatshop! Saya ingin bertanya mengenai ketersediaan daging segar dan pemesanan hari ini.'
  );
  const waUrl = `https://wa.me/${phone}?text=${greeting}`;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-end gap-3 select-none">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-[#202020] text-xs font-medium py-2 px-3.5 rounded-2xl shadow-xl border border-stone-200 animate-fade-in relative">
          <span>Butuh bantuan cepat atau pesanan khusus?</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-stone-400 hover:text-stone-700 ml-1"
            aria-label="Tutup petunjuk WhatsApp"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute -left-1.5 bottom-3 w-3 h-3 bg-white border-l border-b border-stone-200 rotate-45"></div>
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi WhatsApp Avatar Meatshop"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.59 20.16 9.17 19.78 7.92 19.04L7.63 18.87L4.51 19.69L5.34 16.65L5.15 16.35C4.34 15.06 3.8 13.51 3.8 11.92C3.8 7.37 7.5 3.67 12.05 3.67M9.13 7.39C8.97 7.39 8.7 7.45 8.48 7.71C8.25 7.97 7.63 8.57 7.63 9.77C7.63 10.97 8.5 12.13 8.63 12.3C8.75 12.46 10.35 14.94 12.8 16C13.38 16.25 13.84 16.41 14.19 16.52C14.78 16.71 15.31 16.68 15.74 16.62C16.21 16.55 17.19 16.02 17.39 15.45C17.6 14.88 17.6 14.39 17.53 14.29C17.47 14.19 17.3 14.13 17.03 14C16.77 13.87 15.47 13.23 15.23 13.14C14.99 13.06 14.82 13.02 14.65 13.28C14.47 13.54 13.98 14.13 13.83 14.29C13.68 14.46 13.53 14.48 13.27 14.35C13 14.22 12.16 13.94 11.16 13.05C10.38 12.35 9.85 11.49 9.72 11.27C9.59 11.05 9.71 10.93 9.84 10.8C9.96 10.68 10.1 10.5 10.23 10.35C10.37 10.2 10.41 10.09 10.5 9.91C10.59 9.74 10.54 9.59 10.48 9.46C10.41 9.33 9.9 8.08 9.68 7.57C9.47 7.07 9.26 7.14 9.13 7.39Z" />
        </svg>
      </a>
    </div>
  );
};
