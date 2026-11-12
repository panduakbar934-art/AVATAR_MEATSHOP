import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  InventoryMovement,
  StoreSettings,
  OrderStatus,
  PaymentStatus,
} from '../types';
import {
  loadProducts,
  saveProducts,
  loadOrders,
  saveOrders,
  loadMovements,
  saveMovements,
  loadSettings,
  saveSettings,
  loadAdminAuth,
  saveAdminAuth,
  resetAllDemoData,
} from '../utils/storage';
import { generateOrderId } from '../utils/pricing';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  movements: InventoryMovement[];
  settings: StoreSettings;
  isAdmin: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  recordBarangMasuk: (productId: string, quantity: number, costPrice: number, notes: string) => void;
  recordBarangKeluar: (productId: string, quantity: number, notes: string) => void;
  importProductsFromCSV: (validProducts: Partial<Product>[]) => { added: number; updated: number };
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetDemo(): Promise<void>;
  loginAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(loadSettings());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setProducts(loadProducts());
    setOrders(loadOrders());
    setMovements(loadMovements());
    setSettings(loadSettings());
    setIsAdmin(loadAdminAuth());
    setIsInitialized(true);
  }, []);

  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newId = `AVT-${Date.now().toString().slice(-4)}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      stock: Math.round(Number(productData.stock || 0) * 1000) / 1000,
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveProducts(updated);

    if (newProduct.stock > 0) {
      const movement: InventoryMovement = {
        id: `MOV-${Date.now()}`,
        productId: newId,
        productName: newProduct.name,
        type: 'Masuk',
        quantity: newProduct.stock,
        unit: newProduct.unit,
        costPrice: newProduct.cost_price,
        date: new Date().toISOString(),
        notes: 'Inisialisasi stok produk baru',
      };
      const updatedMovs = [movement, ...movements];
      setMovements(updatedMovs);
      saveMovements(updatedMovs);
    }
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          stock: updates.stock !== undefined ? Math.round(Number(updates.stock) * 1000) / 1000 : p.stock,
        };
      }
      return p;
    });
    setProducts(updated);
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
  };

  const recordBarangMasuk = (
    productId: string,
    quantity: number,
    costPrice: number,
    notes: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const addedQty = Math.round(quantity * 1000) / 1000;
    const newStock = Math.round((product.stock + addedQty) * 1000) / 1000;

    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, stock: newStock, cost_price: costPrice || p.cost_price } : p
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    const movement: InventoryMovement = {
      id: `MOV-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: 'Masuk',
      quantity: addedQty,
      unit: product.unit,
      costPrice,
      date: new Date().toISOString(),
      notes: notes || 'Penerimaan stok barang masuk',
    };
    const updatedMovs = [movement, ...movements];
    setMovements(updatedMovs);
    saveMovements(updatedMovs);
  };

  const recordBarangKeluar = (productId: string, quantity: number, notes: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const reducedQty = Math.round(quantity * 1000) / 1000;
    const newStock = Math.max(0, Math.round((product.stock - reducedQty) * 1000) / 1000);

    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, stock: newStock } : p
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    const movement: InventoryMovement = {
      id: `MOV-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: 'Keluar',
      quantity: reducedQty,
      unit: product.unit,
      costPrice: product.cost_price,
      date: new Date().toISOString(),
      notes: notes || 'Barang keluar / susut / sampel',
    };
    const updatedMovs = [movement, ...movements];
    setMovements(updatedMovs);
    saveMovements(updatedMovs);
  };

  const importProductsFromCSV = (validProducts: Partial<Product>[]) => {
    let added = 0;
    let updatedCount = 0;
    const workingList = [...products];
    const newMovements: InventoryMovement[] = [];

    validProducts.forEach((vp) => {
      if (!vp.id || !vp.name) return;
      const existingIdx = workingList.findIndex((p) => p.id === vp.id);
      const cleanStock = Math.round(Number(vp.stock || 0) * 1000) / 1000;

      if (existingIdx >= 0) {
        workingList[existingIdx] = {
          ...workingList[existingIdx],
          ...vp,
          stock: cleanStock,
        } as Product;
        updatedCount++;
      } else {
        const fullProd: Product = {
          id: vp.id,
          name: vp.name,
          category: vp.category || 'Daging Sapi',
          description: vp.description || `${vp.name} segar Avatar Meatshop`,
          price: vp.price || 0,
          unit: vp.unit || 'kg',
          stock: cleanStock,
          cost_price: vp.cost_price || 0,
          image: vp.image || 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
          isActive: true,
          isFeatured: false,
        };
        workingList.push(fullProd);
        added++;

        if (fullProd.stock > 0) {
          newMovements.push({
            id: `MOV-${Date.now()}-${added}`,
            productId: fullProd.id,
            productName: fullProd.name,
            type: 'Masuk',
            quantity: fullProd.stock,
            unit: fullProd.unit,
            costPrice: fullProd.cost_price,
            date: new Date().toISOString(),
            notes: 'Import CSV stok awal',
          });
        }
      }
    });

    setProducts(workingList);
    saveProducts(workingList);

    if (newMovements.length > 0) {
      const mergedMovs = [...newMovements, ...movements];
      setMovements(mergedMovs);
      saveMovements(mergedMovs);
    }

    return { added, updated: updatedCount };
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const orderId = generateOrderId();
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
    };

    // Deduct stock for each ordered item
    const newMovements: InventoryMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const matchedItem = newOrder.items.find((item) => item.productId === prod.id);
      if (matchedItem) {
        const remainingStock = Math.max(
          0,
          Math.round((prod.stock - matchedItem.quantity) * 1000) / 1000
        );
        newMovements.push({
          id: `MOV-${Date.now()}-${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          type: 'Penjualan',
          quantity: matchedItem.quantity,
          unit: prod.unit,
          date: new Date().toISOString(),
          notes: `Transaksi pesanan ${orderId} (${newOrder.customerName})`,
        });
        return { ...prod, stock: remainingStock };
      }
      return prod;
    });

    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    if (newMovements.length > 0) {
      const mergedMovs = [...newMovements, ...movements];
      setMovements(mergedMovs);
      saveMovements(mergedMovs);
    }

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o));
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, paymentStatus: status } : o));
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.orderStatus === 'Dibatalkan') return;

    // Restore stock if not restored yet
    if (!targetOrder.stockRestoredOnCancel) {
      const newMovements: InventoryMovement[] = [];
      const updatedProducts = products.map((prod) => {
        const item = targetOrder.items.find((i) => i.productId === prod.id);
        if (item) {
          const restoredStock = Math.round((prod.stock + item.quantity) * 1000) / 1000;
          newMovements.push({
            id: `MOV-RESTORE-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            type: 'Pembatalan',
            quantity: item.quantity,
            unit: prod.unit,
            date: new Date().toISOString(),
            notes: `Pengembalian stok pembatalan pesanan ${orderId}${reason ? ` (${reason})` : ''}`,
          });
          return { ...prod, stock: restoredStock };
        }
        return prod;
      });

      setProducts(updatedProducts);
      saveProducts(updatedProducts);

      if (newMovements.length > 0) {
        const mergedMovs = [...newMovements, ...movements];
        setMovements(mergedMovs);
        saveMovements(mergedMovs);
      }
    }

    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            orderStatus: 'Dibatalkan' as OrderStatus,
            stockRestoredOnCancel: true,
          }
        : o
    );
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const updated: StoreSettings = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  const resetDemo = async () => {
    await resetAllDemoData();
    setProducts(loadProducts());
    setOrders(loadOrders());
    setMovements(loadMovements());
    setSettings(loadSettings());
  };

  const loginAdmin = (user: string, pass: string): boolean => {
    if (user.trim() === 'admin' && pass.trim() === 'avatar123') {
      setIsAdmin(true);
      saveAdminAuth(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    saveAdminAuth(false);
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        movements,
        settings,
        isAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        recordBarangMasuk,
        recordBarangKeluar,
        importProductsFromCSV,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        cancelOrder,
        updateSettings,
        resetDemo,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
