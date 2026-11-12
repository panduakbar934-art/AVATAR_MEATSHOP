import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from '../../components/BrandLogo';
import { useToast } from '../../components/Toast';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { isAdmin, logoutAdmin, resetDemo } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Auth Guard
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logoutAdmin();
    showToast('Anda telah keluar dari panel admin.', 'info');
    navigate('/');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset semua data demo ke kondisi bawaan? Semua pesanan dan stok baru akan dipulihkan ke awal.')) {
      resetDemo();
      showToast('Data demo berhasil direset ke kondisi awal.', 'info');
    }
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { name: 'Manajemen Produk', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { name: 'Inventaris & Stok', path: '/admin/inventory', icon: <Boxes className="w-4 h-4" /> },
    { name: 'Kelola Pesanan', path: '/admin/orders', icon: <ClipboardList className="w-4 h-4" /> },
    { name: 'Pengaturan Toko', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#191919] text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <BrandLogo variant="light" size="sm" asLink={false} />
        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="text-stone-300 hover:text-white p-2 rounded"
            title="Lihat Website"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 text-stone-200"
            aria-label="Toggle menu admin"
          >
            {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-[#191919] text-white z-40 flex flex-col justify-between p-5 transition-transform duration-300 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Subtitle */}
          <div className="pb-5 border-b border-stone-800">
            <BrandLogo variant="light" size="sm" asLink={false} />
            <div className="text-[10px] uppercase font-bold text-[#FF3B20] tracking-wider mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B20]"></span>
              <span>Admin Management Hub</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FF3B20] text-white shadow-md shadow-[#FF3B20]/25'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-stone-800 space-y-2 text-xs">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#FF3B20]" />
              <span>Lihat Website Toko</span>
            </span>
          </Link>

          <button
            onClick={handleResetDemo}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-stone-400 hover:text-amber-400 hover:bg-stone-800/60 transition-colors text-left"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Demo</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-stone-400 hover:text-red-400 hover:bg-stone-800/60 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
