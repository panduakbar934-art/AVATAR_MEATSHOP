import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../components/Toast';
import { BrandLogo } from '../../components/BrandLogo';
import { Lock, User, KeyRound, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, isAdmin } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('avatar123');

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(username, password);
    if (success) {
      showToast('Login berhasil. Selamat datang di Panel Admin Avatar Meatshop.', 'success');
      navigate('/admin');
    } else {
      showToast('Kredensial salah. Gunakan username: admin dan password: avatar123', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#FF3B20] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Website Pembeli</span>
        </Link>

        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <BrandLogo size="md" asLink={false} />
            </div>
            <h1
              className="text-2xl font-black text-[#191919] tracking-tight"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              Admin Dashboard Login
            </h1>
            <p className="text-stone-500 text-xs">
              Simulasi akses manajemen produk, stok inventaris, dan transaksi.
            </p>
          </div>

          {/* Demo credentials hint box */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Kredensial Demo (Sesuai PRD):</span>
            </div>
            <div className="font-mono text-[11px] pt-1">
              Username: <strong className="text-stone-900">admin</strong>
              <br />
              Password: <strong className="text-stone-900">avatar123</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#FF3B20] hover:bg-[#D92B17] text-white font-bold text-sm uppercase tracking-wider shadow-md shadow-[#FF3B20]/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
