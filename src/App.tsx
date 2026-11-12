import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';
import { DemoBanner } from './components/DemoBadge';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppFloating } from './components/WhatsAppFloating';

// Customer Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminSettings } from './pages/admin/AdminSettings';

/**
 * Automatically scrolls window to top when route path changes
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * Customer Layout containing Banner, Navbar, CartDrawer, WhatsApp FAB, and Footer
 */
const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#202020]">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <WhatsAppFloating />
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <CartProvider>
          <ToastProvider>
            <ScrollToTop />
            <Routes>
              {/* Customer Facing Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:id" element={<OrderSuccess />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all 404 Route */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center p-4 text-center">
                    <div className="space-y-4">
                      <h1 className="text-4xl font-black text-[#191919]">404</h1>
                      <p className="text-stone-500 text-sm">Halaman yang Anda tuju tidak ditemukan.</p>
                      <a
                        href="/"
                        className="inline-block px-6 py-2.5 rounded-xl bg-[#FF3B20] text-white font-bold text-xs uppercase"
                      >
                        Kembali ke Beranda
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
