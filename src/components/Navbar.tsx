import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { totals, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Katalog Produk', path: '/products' },
    { name: 'Tentang Kami', path: '/about' },
    { name: 'Kontak', path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/80 py-3'
          : 'bg-[#F7F7F5] border-b border-stone-200/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <BrandLogo size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-200 hover:text-[#FF3B20] relative py-1 ${
                    isActive
                      ? 'text-[#FF3B20] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FF3B20]'
                      : 'text-[#202020]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Search Toggle / Box */}
            <div className="relative">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-stone-100 rounded-full pl-3 pr-1 py-1 border border-stone-300"
                >
                  <input
                    type="text"
                    placeholder="Cari daging, sirloin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-32 sm:w-48 bg-transparent text-xs sm:text-sm text-[#202020] placeholder-stone-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-1 text-stone-500 hover:text-[#FF3B20]"
                    aria-label="Cari"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-1 text-stone-400 hover:text-stone-700"
                    aria-label="Tutup pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-stone-700 hover:text-[#FF3B20] hover:bg-stone-200/60 rounded-full transition-colors"
                  aria-label="Buka pencarian produk"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-stone-800 hover:text-[#FF3B20] hover:bg-stone-200/60 rounded-full transition-colors"
              aria-label="Buka keranjang belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {totals.totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-white bg-[#FF3B20] rounded-full ring-2 ring-white animate-scale-in">
                  {totals.totalItemsCount}
                </span>
              )}
            </button>

            {/* CTA Button: Pesan Sekarang */}
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF3B20] hover:bg-[#D92B17] text-white text-xs font-bold tracking-wide uppercase shadow-sm shadow-[#FF3B20]/30 hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <span>Pesan Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-stone-800 hover:text-[#FF3B20] hover:bg-stone-200/60 rounded-lg transition-colors"
              aria-label={isMobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-stone-200 pb-4 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari daging, sirloin, ayam..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-[#202020] placeholder-stone-400 pl-10 focus:outline-none focus:ring-2 focus:ring-[#FF3B20]"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </form>

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#FF3B20]/10 text-[#FF3B20]'
                        : 'text-[#202020] hover:bg-stone-100'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="pt-2 mt-2 border-t border-stone-200 flex flex-col gap-2">
                <Link
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF3B20] text-white font-bold text-sm shadow-md text-center"
                >
                  <span>Pesan Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs text-stone-500 hover:text-stone-900"
                >
                  Akses Admin Dashboard (Demo)
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
