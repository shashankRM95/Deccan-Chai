import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Package, Users, BarChart3, CreditCard, Settings, FileText, LifeBuoy, LogOut,
  TrendingUp, ArrowRight, Clock, CheckCircle2, AlertTriangle, DollarSign, ShoppingCart, Calendar, Loader2, Plus, Trash2, Edit2, X,
} from 'lucide-react';
import { useRouter } from '@/router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Tab = 'overview' | 'orders' | 'menu' | 'inventory' | 'staff' | 'analytics' | 'customers' | 'settings' | 'reports' | 'support';

export function OwnerDashboard() {
  const { navigate } = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('owner-login');
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="pt-24 min-h-screen grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div>;
  }
  if (!user) return null;

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-grain flex">
      <aside className={`fixed lg:sticky top-16 lg:top-20 left-0 z-40 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] w-64 bg-navy-950 text-cream-100 border-r border-cream-100/10 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between lg:justify-start gap-2">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center w-10 h-10 rounded-full bg-maroon-700 text-gold-300 font-sans font-bold text-sm">
              {profile?.full_name?.charAt(0).toUpperCase() || 'O'}
            </div>
            <div className="min-w-0">
              <p className="font-sans font-bold text-sm truncate">{profile?.full_name || 'Store Owner'}</p>
              <p className="text-xs text-gold-400">Jubilee Hills Store</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-cream-200/60"><X className="w-5 h-5" /></button>
        </div>

        <nav className="px-3 space-y-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === item.id ? 'bg-maroon-700 text-cream-50' : 'text-cream-200/70 hover:bg-navy-800 hover:text-cream-50'}`}>
              <item.icon className="w-4 h-4 shrink-0" /> {item.label}
            </button>
          ))}
          <div className="my-2 border-t border-cream-100/10 mx-2" />
          <button onClick={async () => { await signOut(); navigate('home'); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors mt-1">
            <LogOut className="w-4 h-4 shrink-0" /> Logout
          </button>
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0 p-5 lg:p-8">
        <div className="lg:hidden flex items-center justify-between mb-5">
          <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-cream-200"><LayoutDashboard className="w-5 h-5" /> Menu</button>
          <span className="text-sm font-bold text-maroon-700 dark:text-gold-300">Owner Panel</span>
        </div>

        {tab === 'overview' && <OverviewTab onManage={() => setTab('orders')} />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'menu' && <MenuMgmtTab />}
        {tab === 'inventory' && <InventoryTab />}
        {tab === 'staff' && <StaffTab />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'customers' && <CustomersTab />}
        {tab === 'settings' && <StoreSettingsTab />}
        {tab === 'reports' && <ReportsTab />}
        {tab === 'support' && <SupportTab />}
      </main>
    </div>
  );
}

/* ============ OVERVIEW ============ */
function OverviewTab({ onManage }: { onManage: () => void }) {
  const [metrics, setMetrics] = useState({ todayOrders: 0, todayRev: 0, pendingPay: 0, monthRev: 0 });

  useEffect(() => {
    const loadMetrics = async () => {
      const { data } = await supabase.from('orders').select('*');
      if (data) {
        const today = new Date().toDateString();
        const todayOrdersList = data.filter((o: any) => new Date(o.placed_at || o.created_at).toDateString() === today);
        const todayOrders = todayOrdersList.length;
        const todayRev = todayOrdersList.reduce((acc: number, o: any) => acc + parseFloat(o.total || 0), 0);
        const pendingPay = data.filter((o: any) => o.payment_status === 'Pending').reduce((acc: number, o: any) => acc + parseFloat(o.total || 0), 0);
        const monthRev = data.reduce((acc: number, o: any) => acc + parseFloat(o.total || 0), 0);
        setMetrics({ todayOrders, todayRev, pendingPay, monthRev });
      }
    };
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="heading text-2xl lg:text-3xl">Dashboard Overview</h1>
        <p className="prose-body text-sm mt-1">Jubilee Hills Store · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={ShoppingCart} label="Today's Orders" value={metrics.todayOrders.toString()} change="Real-time" up />
        <MetricCard icon={DollarSign} label="Today's Revenue" value={`₹${metrics.todayRev.toFixed(0)}`} change="Live" up />
        <MetricCard icon={AlertTriangle} label="Pending Collection" value={`₹${metrics.pendingPay.toFixed(0)}`} change="Unsettled" up={false} />
        <MetricCard icon={Calendar} label="Total Store Revenue" value={`₹${metrics.monthRev.toFixed(0)}`} change="Gross" up />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-sans font-bold text-lg text-navy-900 dark:text-cream-50">Live Orders Control</h2>
          <button onClick={onManage} className="btn-primary text-xs py-2 px-3">Open Orders Tab →</button>
        </div>
        <div className="card p-5 text-center">
          <p className="text-sm text-navy-500 dark:text-cream-200/60">Manage real customer table orders and update live preparation status.</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, change, up }: { icon: any; label: string; value: string; change: string; up: boolean }) {
  return (
    <div className="card p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300">
          <Icon className="w-5 h-5" />
        </div>
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {change}
        </span>
      </div>
      <p className="text-xs text-navy-500 dark:text-cream-200/60 mb-0.5">{label}</p>
      <p className="font-sans font-extrabold text-2xl text-navy-900 dark:text-cream-50">{value}</p>
    </div>
  );
}

/* ============ ORDERS MANAGEMENT (LIVE CUSTOMERS & CUSTOMIZATIONS) ============ */
function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*), profiles(full_name, phone)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    // Realtime subscription for instant updates
    const channel = supabase
      .channel('owner-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    // Polling fallback every 10s (in case realtime isn't working)
    const pollInterval = setInterval(fetchOrders, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [fetchOrders]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    try {
      const activeStr = localStorage.getItem('deccan-chai-order');
      if (activeStr) {
        const active = JSON.parse(activeStr);
        if (active && (active.id === id || active.orderNumber === id)) {
          active.status = newStatus;
          localStorage.setItem('deccan-chai-order', JSON.stringify(active));
        }
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('deccan_order_updated', { detail: { id, newStatus } }));
  };

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="heading text-2xl lg:text-3xl">Live Customer Orders</h1>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live sync with customer table orders
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['All', 'Received', 'Preparing', 'Ready', 'Served', 'Cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${filter === f ? 'bg-maroon-700 text-cream-50' : 'bg-cream-100 dark:bg-navy-800 text-navy-600 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-navy-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <ShoppingBag className="w-10 h-10 text-navy-300 dark:text-cream-200/20 mx-auto mb-3" />
          <p className="font-sans font-bold text-navy-900 dark:text-cream-50">No customer orders placed yet</p>
          <p className="text-sm text-navy-500 dark:text-cream-200/60 mt-1">Live table orders will automatically pop up here as customers place them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(o => (
            <div key={o.id} className="card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-extrabold text-base text-navy-900 dark:text-cream-50">Order #{o.order_number || o.id.toString().slice(-6)}</span>
                    <span className="text-xs text-navy-500 dark:text-cream-200/60">
                      {new Date(o.placed_at || o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Table {o.table_number || 1}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gold-600 dark:text-gold-400 mt-0.5">
                    Customer: {o.profiles?.full_name || o.customer_name || 'Walk-in Guest'} {o.profiles?.phone ? `(${o.profiles.phone})` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-sans font-bold text-lg text-maroon-700 dark:text-gold-300">₹{o.total}</p>
                    <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold">{o.payment_status || 'Paid'}</p>
                  </div>

                  <div className="flex items-center gap-2 bg-cream-100 dark:bg-navy-800 p-1.5 rounded-xl">
                    <label className="text-[10px] font-bold uppercase text-navy-500 dark:text-cream-200/60 px-1">Live Status:</label>
                    <select
                      value={o.status || 'Received'}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="text-xs font-bold rounded-lg px-2.5 py-1 bg-white dark:bg-navy-900 text-maroon-800 dark:text-gold-300 border border-cream-300 dark:border-cream-100/10 focus:ring-2 focus:ring-gold-400"
                    >
                      <option value="Received">Received</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Served">Served</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line items with customization details */}
              {o.order_items && o.order_items.length > 0 && (
                <div className="bg-cream-50 dark:bg-navy-800/40 p-3.5 rounded-xl space-y-2 border border-cream-200/40 dark:border-cream-100/10 text-xs">
                  {o.order_items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-navy-900 dark:text-cream-50">{item.quantity}x {item.item_name}</span>
                        <p className="text-navy-600 dark:text-cream-200/70 text-[11px]">
                          Sugar: {item.sugar_level || 'Medium'} · Milk: {item.milk_type || 'Regular'} · Temperature: {item.temperature || 'Hot'}
                          {item.notes ? ` · Note: "${item.notes}"` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-navy-900 dark:text-cream-50">₹{(parseFloat(item.price) || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ MENU MANAGEMENT ============ */
function MenuMgmtTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from('menu_items').select('*').order('sort_order');
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const toggleAvailable = async (id: string, available: boolean) => {
    await supabase.from('menu_items').update({ available: !available }).eq('id', id);
    setItems(items.map(i => i.id === id ? { ...i, available: !available } : i));
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    await supabase.from('menu_items').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem({ name: '', category: 'Milk Tea', price: '', description: '', prep_time: 5, popular: false, available: true });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.name || !editingItem.price) return;

    const payload = {
      name: editingItem.name,
      category: editingItem.category,
      price: parseFloat(editingItem.price),
      description: editingItem.description,
      prep_time: parseInt(editingItem.prep_time, 10) || 5,
      popular: !!editingItem.popular,
      available: editingItem.available !== false,
    };

    if (editingItem.id) {
      await supabase.from('menu_items').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('menu_items').insert([payload]);
    }

    setIsModalOpen(false);
    fetchItems();
  };

  const filtered = activeCat === 'All' ? items : items.filter(i => i.category === activeCat);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="heading text-2xl lg:text-3xl">Menu Item Management</h1>
          <p className="text-xs text-navy-500 dark:text-cream-200/60 mt-0.5">Edit prices, availability, and menu items</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add New Menu Item
        </button>
      </div>

      {loading ? <div className="grid place-items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="card p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50">{item.name}</h3>
                  <span className="font-bold text-maroon-700 dark:text-gold-300">₹{item.price}</span>
                </div>
                <p className="text-xs text-navy-500 dark:text-cream-200/60 mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-cream-200/40 dark:border-cream-100/10">
                <button
                  onClick={() => toggleAvailable(item.id, item.available)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.available ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                >
                  {item.available ? 'Available' : 'Out of Stock'}
                </button>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(item)} className="p-1.5 rounded-lg text-navy-600 hover:bg-cream-100 dark:text-cream-200"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 glass-overlay grid place-items-center p-4">
          <div className="card p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-bold text-lg text-navy-900 dark:text-cream-50">{editingItem?.id ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-navy-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Item Name</label>
                <input required value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <input required value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Price (₹)</label>
                  <input required type="number" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: e.target.value })} className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea rows={2} value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1 py-2 text-xs">Save Item</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 py-2 text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ INVENTORY (ONLY REAL DATA) ============ */
function InventoryTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({ item_name: '', current_stock: '', min_stock: '', unit: 'kg' });

  const fetchInventory = useCallback(async () => {
    const { data } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
    else setItems([]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ item_name: '', current_stock: '', min_stock: '', unit: 'kg' });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({ item_name: item.item_name, current_stock: String(item.current_stock), min_stock: String(item.min_stock || 0), unit: item.unit });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentStock = parseFloat(form.current_stock) || 0;
    const minStock = parseFloat(form.min_stock) || 0;
    const status = currentStock <= minStock * 0.5 ? 'CRITICAL' : currentStock <= minStock ? 'LOW' : 'OK';
    const payload = { item_name: form.item_name, current_stock: currentStock, min_stock: minStock, unit: form.unit, status };

    if (editingItem) {
      // Edit mode
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...payload } : i));
      setIsModalOpen(false);
      if (!editingItem.id.startsWith('temp-')) {
        await supabase.from('inventory').update(payload).eq('id', editingItem.id);
      }
    } else {
      // Add mode — optimistic
      const tempId = `temp-${Date.now()}`;
      setItems(prev => [...prev, { id: tempId, ...payload }]);
      setIsModalOpen(false);
      setForm({ item_name: '', current_stock: '', min_stock: '', unit: 'kg' });
      const { data, error } = await supabase.from('inventory').insert([payload]).select().single();
      if (data) setItems(prev => prev.map(i => i.id === tempId ? data : i));
      else if (error) console.warn('Inventory insert error:', error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inventory item?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
    if (!id.startsWith('temp-')) await supabase.from('inventory').delete().eq('id', id);
  };

  const statusColor = (s: string) => s === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : s === 'LOW' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading text-2xl lg:text-3xl">Inventory Tracking</h1>
          <p className="text-xs text-navy-500 dark:text-cream-200/60 mt-0.5">Real raw materials and stock levels</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Inventory Item
        </button>
      </div>

      {loading ? <div className="grid place-items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div> : items.length === 0 ? (
        <div className="card p-10 text-center">
          <Package className="w-10 h-10 text-navy-300 dark:text-cream-200/20 mx-auto mb-3" />
          <p className="font-sans font-bold text-navy-900 dark:text-cream-50">No inventory items added</p>
          <p className="text-xs text-navy-500 dark:text-cream-200/60 mt-1">Click 'Add Inventory Item' to track tea leaves, milk, or cups.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 dark:bg-navy-800 text-xs uppercase tracking-wide text-navy-500 dark:text-cream-200/60">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Item</th>
                <th className="text-right px-4 py-3 font-semibold">Stock</th>
                <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">Min</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200/50 dark:divide-cream-100/5">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-cream-50 dark:hover:bg-navy-800/50">
                  <td className="px-4 py-3 font-bold text-navy-900 dark:text-cream-50">{item.item_name}</td>
                  <td className="px-4 py-3 text-right font-bold text-navy-900 dark:text-cream-50">{item.current_stock} {item.unit}</td>
                  <td className="px-4 py-3 text-right text-navy-600 dark:text-cream-200/70 hidden sm:table-cell">{item.min_stock} {item.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full text-[10px] font-bold px-2.5 py-1 ${statusColor(item.status || 'OK')}`}>
                      {item.status || 'OK'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-navy-600 hover:bg-cream-100 dark:text-cream-200 dark:hover:bg-navy-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 glass-overlay grid place-items-center p-4">
          <div className="card p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-bold text-lg text-navy-900 dark:text-cream-50">{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-navy-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Item Name</label>
                <input required value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} placeholder="e.g. Assam Tea Leaves" className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Current Stock</label>
                  <input required type="number" value={form.current_stock} onChange={e => setForm({ ...form, current_stock: e.target.value })} placeholder="10" className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Min Stock</label>
                  <input type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} placeholder="2" className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit</label>
                  <input required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="kg / L / pcs" className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1 py-2 text-xs">{editingItem ? 'Save Changes' : 'Add Item'}</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 py-2 text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


/* ============ STAFF MANAGEMENT ============ */
function StaffTab() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', role: 'Tea Maker', shift: 'Morning' });

  const fetchStaff = useCallback(async () => {
    const { data } = await supabase.from('staff').select('*').order('created_at', { ascending: true });
    if (data) setStaff(data);
    else setStaff([]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const togglePresent = async (id: string, present: boolean) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, present: !present } : s));
    if (!id.startsWith('temp-')) {
      await supabase.from('staff').update({ present: !present }).eq('id', id);
    }
  };

  const openAdd = () => {
    setEditingStaff(null);
    setForm({ name: '', phone: '', role: 'Tea Maker', shift: 'Morning' });
    setIsModalOpen(true);
  };

  const openEdit = (s: any) => {
    setEditingStaff(s);
    setForm({ name: s.name, phone: s.phone || '', role: s.role, shift: s.shift });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const payload = { name: form.name, phone: form.phone || '+91 98000 00000', role: form.role, shift: form.shift };

    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...payload } : s));
      setIsModalOpen(false);
      if (!editingStaff.id.startsWith('temp-')) {
        await supabase.from('staff').update(payload).eq('id', editingStaff.id);
      }
    } else {
      const staffObj = { ...payload, present: true };
      const tempId = `temp-${Date.now()}`;
      setStaff(prev => [...prev, { id: tempId, ...staffObj }]);
      setIsModalOpen(false);
      setForm({ name: '', phone: '', role: 'Tea Maker', shift: 'Morning' });
      const { data, error } = await supabase.from('staff').insert([staffObj]).select().single();
      if (data) setStaff(prev => prev.map(s => s.id === tempId ? data : s));
      else if (error) console.warn('Staff insert error:', error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this staff member?')) return;
    setStaff(prev => prev.filter(s => s.id !== id));
    if (!id.startsWith('temp-')) await supabase.from('staff').delete().eq('id', id);
  };

  const presentCount = staff.filter(s => s.present).length;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading text-2xl lg:text-3xl">Staff Management</h1>
          <p className="text-xs text-navy-500 dark:text-cream-200/60 mt-0.5">Track employees and toggle attendance</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="font-sans font-extrabold text-2xl text-green-600 dark:text-green-400">{presentCount}</p>
          <p className="text-xs text-navy-500 dark:text-cream-200/60">Present</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-sans font-extrabold text-2xl text-red-500">{staff.length - presentCount}</p>
          <p className="text-xs text-navy-500 dark:text-cream-200/60">Absent</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-sans font-extrabold text-2xl text-navy-900 dark:text-cream-50">{staff.length}</p>
          <p className="text-xs text-navy-500 dark:text-cream-200/60">Total Staff</p>
        </div>
      </div>

      {loading ? <div className="grid place-items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div> : staff.length === 0 ? (
        <div className="card p-10 text-center">
          <Users className="w-10 h-10 text-navy-300 dark:text-cream-200/20 mx-auto mb-3" />
          <p className="font-sans font-bold text-navy-900 dark:text-cream-50">No staff members registered</p>
          <p className="text-xs text-navy-500 dark:text-cream-200/60 mt-1">Click 'Add Staff Member' to create employee records.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 dark:bg-navy-800 text-xs uppercase tracking-wide text-navy-500 dark:text-cream-200/60">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Shift</th>
                <th className="text-center px-4 py-3 font-semibold">Attendance</th>
                <th className="text-center px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200/50 dark:divide-cream-100/5">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-cream-50 dark:hover:bg-navy-800/50">
                  <td className="px-4 py-3">
                    <p className="font-sans font-bold text-navy-900 dark:text-cream-50">{s.name}</p>
                    <p className="text-xs text-navy-400 dark:text-cream-200/50">{s.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-navy-600 dark:text-cream-200/70 hidden sm:table-cell">{s.role}</td>
                  <td className="px-4 py-3 text-navy-600 dark:text-cream-200/70 hidden sm:table-cell">{s.shift}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => togglePresent(s.id, s.present)}
                      className={`inline-flex items-center rounded-full text-xs font-extrabold px-3 py-1.5 transition-all shadow-sm ${
                        s.present ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {s.present ? '✓ Present' : '✕ Absent'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-navy-600 hover:bg-cream-100 dark:text-cream-200 dark:hover:bg-navy-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 glass-overlay grid place-items-center p-4">
          <div className="card p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-bold text-lg text-navy-900 dark:text-cream-50">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-navy-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahul Verma" className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Role</label>
                  <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Tea Maker / Server" className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Shift</label>
                  <input value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} placeholder="Morning / Evening" className="w-full rounded-xl px-3 py-2 bg-cream-50 dark:bg-navy-800 border" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1 py-2 text-xs">{editingStaff ? 'Save Changes' : 'Add Staff'}</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 py-2 text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



/* ============ ANALYTICS (REAL DATA) ============ */
function AnalyticsTab() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, avgOrder: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data } = await supabase.from('orders').select('*');
      if (data) {
        const totalOrders = data.length;
        const totalRevenue = data.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0);
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        setStats({ totalOrders, totalRevenue, avgOrder });
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="heading text-2xl lg:text-3xl">Real Store Analytics</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <p className="text-xs text-navy-500 dark:text-cream-200/60 mb-1">Total Orders</p>
          <p className="font-sans font-extrabold text-3xl text-navy-900 dark:text-cream-50">{stats.totalOrders}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs text-navy-500 dark:text-cream-200/60 mb-1">Total Revenue</p>
          <p className="font-sans font-extrabold text-3xl text-gold-600 dark:text-gold-400">₹{stats.totalRevenue.toFixed(0)}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs text-navy-500 dark:text-cream-200/60 mb-1">Average Order Value</p>
          <p className="font-sans font-extrabold text-3xl text-maroon-700 dark:text-gold-300">₹{stats.avgOrder.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
}



/* ============ CUSTOMERS ============ */
function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'customer');
      if (data) setCustomers(data);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  return (
    <div className="max-w-4xl space-y-5">
      <h1 className="heading text-2xl lg:text-3xl">Registered Customers</h1>
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div>
      ) : customers.length === 0 ? (
        <div className="card p-8 text-center text-sm text-navy-500 dark:text-cream-200/60">
          No registered customer accounts yet.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 dark:bg-navy-800 text-xs uppercase tracking-wide text-navy-500 dark:text-cream-200/60">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Phone</th>
                <th className="text-center px-4 py-3 font-semibold">Loyalty Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200/50 dark:divide-cream-100/5">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-cream-50 dark:hover:bg-navy-800/50">
                  <td className="px-4 py-3 font-sans font-bold text-navy-900 dark:text-cream-50">{c.full_name || 'Customer'}</td>
                  <td className="px-4 py-3 text-navy-600 dark:text-cream-200/70 hidden sm:table-cell">{c.phone || 'N/A'}</td>
                  <td className="px-4 py-3 text-center font-bold text-gold-600 dark:text-gold-400">{c.loyalty_points || 0} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============ STORE SETTINGS (SYNC TABLE COUNT TO CUSTOMER) ============ */
function StoreSettingsTab() {
  const [tableCount, setTableCountState] = useState<number>(() => {
    const saved = localStorage.getItem('deccan_store_tables');
    return saved ? parseInt(saved, 10) : 15;
  });
  const [tableSaving, setTableSaving] = useState(false);
  const [tableSaved, setTableSaved] = useState(false);

  const saveTableCount = async (count: number) => {
    setTableSaving(true);
    localStorage.setItem('deccan_store_tables', count.toString());
    // Get first outlet id
    const { data } = await supabase.from('outlets').select('id').limit(1).maybeSingle();
    if (data?.id) {
      // Save actual table_count so OrderPage picks it up
      await supabase.from('outlets').update({ table_count: count }).eq('id', data.id);
    }
    window.dispatchEvent(new CustomEvent('deccan_store_settings_updated', { detail: { table_count: count } }));
    setTableSaving(false);
    setTableSaved(true);
    setTimeout(() => setTableSaved(false), 2000);
  };

  const changeTableCount = (delta: number) => {
    const next = Math.max(1, Math.min(50, tableCount + delta));
    setTableCountState(next);
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="heading text-2xl lg:text-3xl">Store Settings</h1>

      <div className="card p-5 space-y-4">
        <div>
          <h2 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-1">Table Management</h2>
          <p className="text-xs text-navy-500 dark:text-cream-200/60">Set how many tables your store has. This count immediately syncs to customer table selection.</p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <button onClick={() => changeTableCount(-1)} className="grid place-items-center w-10 h-10 rounded-xl border-2 border-maroon-700/30 text-maroon-700 dark:text-gold-300 hover:bg-maroon-50 font-bold text-xl">
              −
            </button>
            <div className="text-center">
              <p className="font-sans font-extrabold text-4xl text-navy-900 dark:text-cream-50">{tableCount}</p>
              <p className="text-xs text-navy-500 dark:text-cream-200/60">tables</p>
            </div>
            <button onClick={() => changeTableCount(1)} className="grid place-items-center w-10 h-10 rounded-xl border-2 border-maroon-700/30 text-maroon-700 dark:text-gold-300 hover:bg-maroon-50 font-bold text-xl">
              +
            </button>
          </div>

          <div className="flex-1">
            <p className="text-xs text-navy-500 dark:text-cream-200/60 mb-2">Preview ({tableCount} tables active)</p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: Math.min(tableCount, 20) }, (_, i) => i + 1).map(t => (
                <span key={t} className="inline-grid place-items-center w-7 h-7 rounded-lg bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300 text-xs font-bold">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => saveTableCount(tableCount)}
          disabled={tableSaving}
          className="btn-primary text-sm py-2.5 w-full sm:w-auto"
        >
          {tableSaving ? 'Saving...' : tableSaved ? 'Saved! ✓' : 'Save Table Count'}
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-sans font-bold text-navy-900 dark:text-cream-50">General Store Details</h2>
        <SettingField label="Store Name" value="Deccan Chai - Jubilee Hills" />
        <SettingField label="Phone" value="+91 9852128128" />
        <SettingField label="Address" value="Jubilee Hills, Hyderabad, Telangana" />
        <SettingField label="Opening Hours" value="Mon - Sat: 9:00 AM - 7:00 PM" />
      </div>
    </div>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-navy-500 dark:text-cream-200/60 mb-1.5">{label}</label>
      <input defaultValue={value} className="w-full rounded-xl px-4 py-2.5 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 text-navy-900 dark:text-cream-50" />
    </div>
  );
}

/* ============ REPORTS ============ */
function ReportsTab() {
  const reports = [
    { label: 'Daily Sales Report', format: 'PDF', icon: FileText },
    { label: 'Weekly Analytics', format: 'Excel', icon: BarChart3 },
    { label: 'Inventory Report', format: 'PDF', icon: Package },
  ];

  const handleDownload = (label: string) => {
    const content = `Deccan Chai Report: ${label}\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${label.toLowerCase().replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="heading text-2xl lg:text-3xl">Reports & Exports</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        {reports.map(r => (
          <button key={r.label} onClick={() => handleDownload(r.label)} className="card p-4 flex items-center gap-3 hover:shadow-md transition-all text-left">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300">
              <r.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50">{r.label}</p>
              <p className="text-xs text-navy-500 dark:text-cream-200/60">{r.format} Download</p>
            </div>
            <ArrowRight className="w-4 h-4 text-navy-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ SUPPORT ============ */
function SupportTab() {
  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="heading text-2xl lg:text-3xl">Owner Support</h1>
      <div className="card p-6 space-y-3">
        <p className="text-sm text-navy-700 dark:text-cream-200">Need help with your store terminal or POS integration?</p>
        <p className="text-xs text-navy-500 dark:text-cream-200/60">Support Line: +91 98521 28128 · support@deccanchai.com</p>
      </div>
    </div>
  );
}
