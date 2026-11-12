import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from './Toast';
import { ShieldCheck, RotateCcw, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  const { resetDemo, isAdmin } = useStore();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan semua data katalog, stok, dan pesanan ke kondisi demo awal?')) {
      resetDemo();
      showToast('Data demo berhasil direset ke kondisi awal.', 'info');
    }
  };

  return (
    <aside aria-label="Simulasi Demo Bar" className="bg-[#191919] text-white border-b border-white/10 text-xs py-1.5 px-4 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF3B20]/20 text-[#FF3B20] font-semibold text-[11px] border border-[#FF3B20]/30 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B20] animate-pulse"></span>
            Simulasi Demo
          </span>
          <span className="hidden sm:inline text-white/70">
            Penyimpanan data lokal di browser. Transaksi dan pembayaran QRIS/COD disimulasikan.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-white/80 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors font-medium text-[11px]"
            title="Reset semua data ke kondisi default"
          >
            <RotateCcw className="w-3 h-3 text-[#FF3B20]" />
            <span className="hidden md:inline">Reset Data Demo</span>
            <span className="md:hidden">Reset</span>
          </button>

          <Link
            to={isAdmin ? '/admin' : '/admin/login'}
            className="flex items-center gap-1 text-stone-300 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors font-medium text-[11px]"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>{isAdmin ? 'Panel Admin' : 'Login Admin'}</span>
          </Link>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden text-white/60 p-0.5 hover:text-white"
            aria-label="Lihat keterangan simulasi"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="sm:hidden mt-1.5 pt-1.5 border-t border-white/10 text-white/70 text-[10px] leading-relaxed">
          Semua transaksi, pesanan, dan perubahan stok disimpan di browser Anda (LocalStorage). Tidak ada kartu kredit atau pembayaran nyata.
        </div>
      )}
    </aside>
  );
};
