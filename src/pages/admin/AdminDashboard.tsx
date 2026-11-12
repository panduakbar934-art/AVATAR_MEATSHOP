import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { formatIDR, formatNumber, formatWeight } from '../../utils/currency';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Package,
  Boxes,
  TrendingUp,
  Receipt,
  AlertTriangle,
  ArrowRight,
  Plus,
  ArrowDownLeft,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { products, orders, settings } = useStore();

  // Metrics
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'Dibatalkan')
    .reduce((acc, o) => acc + o.total, 0);

  const lowStockThreshold = settings.lowStockThreshold || 15;
  const lowStockProducts = products.filter((p) => p.stock <= lowStockThreshold);
  const recentOrders = orders.slice(0, 5);

  // Chart 1: Daily Sales Trend (from orders)
  const salesByDateData = useMemo(() => {
    const map: Record<string, number> = {};
    // Seed with past 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      map[key] = 0;
    }

    orders.forEach((o) => {
      if (o.orderStatus === 'Dibatalkan') return;
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (map[key] !== undefined) {
        map[key] += o.total;
      }
    });

    return Object.entries(map).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }, [orders]);

  // Chart 2: Top Selling Products
  const topProductsData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.orderStatus === 'Dibatalkan') return;
      o.items.forEach((item) => {
        const itemName = item.productName || (item as any).name || 'Daging';
        map[itemName] = (map[itemName] || 0) + item.quantity;
      });
    });

    const list = Object.entries(map)
      .map(([name, qty]) => ({ name: name.split(' (')[0], qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    if (list.length === 0) {
      return [
        { name: 'Sirloin Steak', qty: 25 },
        { name: 'Ayam Karkas', qty: 40 },
        { name: 'Dada Fillet', qty: 18 },
        { name: 'Bakso Urat', qty: 15 },
      ];
    }
    return list;
  }, [orders]);

  // Chart 3: Category Distribution
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return Object.entries(map).map(([category, count]) => ({
      name: category,
      value: count,
    }));
  }, [products]);

  const PIE_COLORS = ['#FF3B20', '#191919', '#E9A23B', '#238B57'];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
            Simulasi Operasional
          </span>
          <h1
            className="text-2xl sm:text-3xl font-black text-[#191919] tracking-tight mt-0.5"
            style={{ fontFamily: 'Plus Jakarta Sans' }}
          >
            Dashboard Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-[#191919] hover:bg-black text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </Link>
          <Link
            to="/admin/inventory"
            className="px-4 py-2.5 rounded-xl bg-[#FF3B20] hover:bg-[#D92B17] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Catat Barang Masuk</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Total Produk
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF3B20] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#191919]">{totalProducts}</div>
          <div className="text-[11px] text-stone-500">Daging sapi, ayam, & olahan aktif</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Total Stok Fisik
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#191919]">{formatNumber(totalStock)}</div>
          <div className="text-[11px] text-stone-500">Akumulasi kuantitas (kg / pack / pcs)</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Total Transaksi
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#191919]">{totalOrders}</div>
          <div className="text-[11px] text-stone-500">Pesanan masuk di LocalStorage</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Pendapatan DEMO
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#191919] truncate">{formatIDR(totalRevenue)}</div>
          <div className="text-[11px] text-stone-500">Simulasi omset penjualan toko</div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#191919]">Tren Penjualan (DEMO)</h3>
              <p className="text-xs text-stone-400">Total nilai pesanan per hari</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
              7 Hari Terakhir
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDateData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B20" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF3B20" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatIDR(Number(val)), 'Penjualan']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF3B20"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#191919]">Distribusi Kategori</h3>
            <p className="text-xs text-stone-400">Proporsi produk per divisi</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-stone-100">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                ></span>
                <span className="text-stone-600 truncate">{cat.name}:</span>
                <strong className="text-stone-900">{cat.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Low Stock Alert & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Alert */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-base text-[#191919]">Peringatan Stok Menipis</h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
              {lowStockProducts.length} Produk
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">
              Semua persediaan produk aman di atas ambang batas ({lowStockThreshold}).
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs"
                >
                  <div>
                    <strong className="font-bold text-stone-900 block truncate max-w-[180px]">
                      {p.name}
                    </strong>
                    <span className="text-stone-500">Sisa: {formatWeight(p.stock, p.unit)}</span>
                  </div>

                  <Link
                    to="/admin/inventory"
                    className="px-2.5 py-1 rounded-lg bg-[#FF3B20] text-white font-bold text-[11px] hover:bg-[#D92B17] transition-colors"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3B20] hover:underline"
          >
            <span>Buka Seluruh Inventaris</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#191919]">Pesanan Terbaru</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#FF3B20] hover:underline flex items-center gap-1"
            >
              <span>Kelola Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">{order.id}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        order.orderStatus === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.orderStatus === 'Dibatalkan'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="text-stone-500 mt-0.5">
                    {order.customerName} • {order.items.length} item
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-stone-900">{formatIDR(order.total)}</div>
                  <div className="text-[10px] text-stone-400 uppercase">{order.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
