import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, ShoppingBag, History, Heart, MapPin, CreditCard, Gift, Settings, LifeBuoy, LogOut,
  Coffee, ArrowRight, Clock, CheckCircle2, ChefHat, Bell, Star, TrendingUp, Plus, X, Loader2, RotateCcw,
} from 'lucide-react';
import { useRouter } from '@/router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/getImageUrl';
import type { Order } from '@/data/types';

import { useCart } from '@/context/CartContext';

type Tab = 'overview' | 'orders' | 'history' | 'favorites' | 'addresses' | 'settings' | 'support';

export function CustomerDashboard() {
  const { navigate } = useRouter();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { reorderLines } = useCart();
  const [tab, setTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    let fetchedOrders: Order[] = [];
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('placed_at', { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      fetchedOrders = data.map((d: any) => {
        const orderItems = (d.order_items || []).map((oi: any) => ({
          uid: oi.id || `oi-${Math.random()}`,
          item: {
            id: oi.menu_item_id || oi.id || 'item-1',
            name: oi.item_name || 'Deccan Chai Item',
            price: parseFloat(oi.price || 0),
            category: 'Milk Tea' as any,
            description: '',
            prepTime: 5,
            image: '/images/menu/kadak-tea.jpg',
          },
          quantity: oi.quantity || 1,
          customization: {
            sugarLevel: oi.sugar_level || 'Medium',
            milkType: oi.milk_type || 'Regular',
            temperature: oi.temperature || 'Hot',
            notes: oi.notes || '',
          },
        }));

        return {
          id: d.id,
          orderNumber: d.order_number || d.id?.toString().slice(-6).toUpperCase(),
          tableNumber: d.table_number,
          lines: orderItems.length > 0 ? orderItems : (d.lines || []),
          status: d.status ? (d.status.charAt(0).toUpperCase() + d.status.slice(1)) : 'Received',
          placedAt: d.placed_at ? new Date(d.placed_at).getTime() : d.created_at ? new Date(d.created_at).getTime() : Date.now(),
          subtotal: parseFloat(d.subtotal || d.total_amount || 0),
          tax: parseFloat(d.tax || 0),
          total: parseFloat(d.total_amount || d.total || 0),
          tip: parseFloat(d.tip || 0),
          paymentMethod: d.payment_method || 'Cash',
          paymentStatus: d.payment_status || 'Paid',
          splitBetween: d.split_between || 1,
        };
      }) as Order[];
    }

    try {
      const savedActiveStr = localStorage.getItem('deccan-chai-order');
      if (savedActiveStr) {
        const savedActive = JSON.parse(savedActiveStr);
        if (savedActive && (savedActive.userId === user.id || !savedActive.userId)) {
          if (!fetchedOrders.some(o => o.id === savedActive.id || o.orderNumber === savedActive.id)) {
            fetchedOrders.unshift(savedActive);
          } else {
            fetchedOrders = fetchedOrders.map(o => (o.id === savedActive.id || o.orderNumber === savedActive.id) ? { ...o, status: savedActive.status } : o);
          }
        }
      }
    } catch {}

    setOrders(fetchedOrders);
    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) navigate('login');
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();

      const handleUpdate = () => fetchOrders();
      window.addEventListener('deccan_order_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);

      const channel = supabase
        .channel(`user-orders-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        window.removeEventListener('deccan_order_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchOrders]);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen grid place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
      </div>
    );
  }

  if (!user) return null;

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'history', label: 'Order History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: LifeBuoy },
  ];

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-grain flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-16 lg:top-20 left-0 z-40 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] w-64 bg-white dark:bg-navy-950 border-r border-cream-300/40 dark:border-cream-100/10 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between lg:justify-start gap-2">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center w-10 h-10 rounded-full bg-maroon-700 text-gold-300 font-sans font-bold text-sm">
              {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50 truncate">{profile?.full_name || 'Customer'}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-navy-500 dark:text-cream-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === item.id
                  ? 'bg-maroon-50 text-maroon-800 dark:bg-navy-800 dark:text-gold-300'
                  : 'text-navy-600 hover:bg-cream-100 dark:text-cream-200/70 dark:hover:bg-navy-800'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
          <div className="my-2 border-t border-cream-200/50 dark:border-navy-700/50 mx-2" />
          <button
            onClick={() => { navigate('menu'); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-navy-600 hover:bg-cream-100 dark:text-cream-200/70 dark:hover:bg-navy-800 transition-colors"
          >
            <Coffee className="w-4 h-4 shrink-0" />
            Browse Full Menu
          </button>
          <button
            onClick={async () => { await signOut(); navigate('home'); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-navy-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-w-0 p-5 lg:p-8">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between mb-5">
          <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-cream-200">
            <LayoutDashboard className="w-5 h-5" /> Menu
          </button>
        </div>

        {tab === 'overview' && <OverviewTab profile={profile} orders={orders} navigate={navigate} loading={dataLoading} />}
        {tab === 'orders' && <OrdersTab orders={orders.filter(o => o.status !== 'Served' && o.status !== 'Cancelled')} loading={dataLoading} />}
        {tab === 'history' && <HistoryTab orders={orders} loading={dataLoading} />}
        {tab === 'favorites' && <FavoritesTab />}
        {tab === 'addresses' && <AddressesTab userId={user.id} />}
        {tab === 'settings' && <SettingsTab profile={profile} userId={user.id} email={user.email || ''} refreshProfile={refreshProfile} />}
        {tab === 'support' && <SupportTab />}
      </main>
    </div>
  );
}

/* ============ OVERVIEW ============ */
function OverviewTab({ profile, orders, navigate, loading }: { profile: any; orders: Order[]; navigate: (r: any) => void; loading: boolean }) {
  const activeOrder = orders.find(o => o.status !== 'Served' && o.status !== 'Cancelled');
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="heading text-2xl lg:text-3xl">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!</h1>
        <p className="prose-body text-sm mt-1">Here's your Deccan Chai account overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={orders.length} color="maroon" />
        <StatCard icon={TrendingUp} label="Total Spent" value={`₹${totalSpent.toFixed(0)}`} color="navy" />
      </div>

      {/* Active order */}
      {activeOrder ? (
        <OrderTracker order={activeOrder} />
      ) : (
        <div className="card p-6 text-center">
          <Coffee className="w-10 h-10 text-navy-300 dark:text-cream-200/20 mx-auto mb-3" />
          <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-1">No active orders</h3>
          <p className="prose-body text-sm mb-4">Ready for a fresh cup of chai?</p>
          <button onClick={() => navigate('order')} className="btn-primary">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        <QuickAction icon={Plus} label="New Order" onClick={() => navigate('order')} />
        <QuickAction icon={RotateCcw} label="Reorder" onClick={() => navigate('menu')} />
        <QuickAction icon={Heart} label="Favorites" onClick={() => navigate('menu')} />
      </div>

      {/* Menu preview */}
      <MenuPreview navigate={navigate} />

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-sans font-bold text-lg text-navy-900 dark:text-cream-50">Recent Orders</h2>
          <button onClick={() => navigate('history')} className="text-sm text-maroon-700 dark:text-gold-300 font-medium hover:underline">View all</button>
        </div>
        {loading ? (
          <div className="card p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-maroon-700 mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="card p-6 text-center prose-body text-sm">No orders yet. Start with a cup of Deccan Chai!</div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50">#{o.orderNumber || o.id.slice(0, 8)}</p>
                  <p className="text-xs text-navy-500 dark:text-cream-200/60">{new Date(o.placedAt).toLocaleDateString()} · {o.tableNumber ? `Table ${o.tableNumber}` : 'Takeaway'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="font-sans font-bold text-sm text-maroon-700 dark:text-gold-300">₹{o.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ ORDER TRACKER ============ */
function OrderTracker({ order }: { order: Order }) {
  const [splitPeople, setSplitPeople] = useState<number>(order.splitBetween || 1);
  const statuses = [
    { status: 'Received', label: 'Confirmed', icon: CheckCircle2 },
    { status: 'Preparing', label: 'Preparing', icon: ChefHat },
    { status: 'Ready', label: 'Ready', icon: Bell },
    { status: 'Served', label: 'Served', icon: CheckCircle2 },
  ] as const;

  const currentIdx = statuses.findIndex(s => s.status === (order.status || 'Received'));
  const perPersonAmount = splitPeople > 1 ? Math.ceil(order.total / splitPeople) : order.total;

  return (
    <div className="card p-5 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans font-bold text-navy-900 dark:text-cream-50">Order #{order.orderNumber || order.id.slice(0, 8)}</p>
          <p className="text-xs text-navy-500 dark:text-cream-200/60">
            {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress */}
      <div className="relative my-4">
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-cream-200 dark:bg-navy-700 rounded-full" />
        <div
          className="absolute top-5 left-5 h-0.5 bg-maroon-700 dark:bg-gold-400 rounded-full transition-all duration-500"
          style={{ width: `calc((100% - 2.5rem) * ${Math.min(currentIdx, statuses.length - 1) / (statuses.length - 1)})` }}
        />
        <div className="relative flex justify-between">
          {statuses.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.status} className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`grid place-items-center w-10 h-10 rounded-full transition-all ${done ? 'bg-maroon-700 dark:bg-gold-400 text-cream-50 dark:text-navy-900' : 'bg-cream-200 dark:bg-navy-700 text-navy-400 dark:text-cream-200/40'} ${active ? 'ring-4 ring-gold-400/30 scale-110' : ''}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className={`text-[10px] font-semibold ${done ? 'text-navy-900 dark:text-cream-50' : 'text-navy-400 dark:text-cream-200/40'}`}>{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items list with Customization details */}
      {order.lines && order.lines.length > 0 && (
        <div className="bg-cream-50 dark:bg-navy-800/40 p-3 rounded-xl space-y-1.5 text-xs border border-cream-200/40 dark:border-cream-100/5">
          {order.lines.map((l: any, i: number) => (
            <div key={i} className="flex justify-between items-start">
              <div>
                <span className="font-bold text-navy-900 dark:text-cream-50">{l.quantity}x {l.item?.name || 'Chai Item'}</span>
                <p className="text-navy-600 dark:text-cream-200/70 text-[11px]">
                  Sugar: {l.customization?.sugarLevel || 'Medium'} · Milk: {l.customization?.milkType || 'Regular'} · Temp: {l.customization?.temperature || 'Hot'}
                  {l.customization?.notes ? ` · Note: ${l.customization.notes}` : ''}
                </p>
              </div>
              <span className="font-bold text-navy-900 dark:text-cream-50">₹{(l.item?.price || 0) * l.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Split Bill controls */}
      <div className="bg-cream-50 dark:bg-navy-800/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-navy-700 dark:text-cream-200/80">Split Bill with friends:</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSplitPeople(s => Math.max(1, s - 1))} className="w-6 h-6 rounded bg-cream-200 dark:bg-navy-700 font-bold grid place-items-center">-</button>
            <span className="font-bold px-1">{splitPeople} person{splitPeople > 1 ? 's' : ''}</span>
            <button onClick={() => setSplitPeople(s => Math.min(10, s + 1))} className="w-6 h-6 rounded bg-cream-200 dark:bg-navy-700 font-bold grid place-items-center">+</button>
          </div>
        </div>
        {splitPeople > 1 && (
          <span className="font-bold text-maroon-700 dark:text-gold-300">
            ₹{perPersonAmount} / person
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm pt-2 border-t border-cream-200/50 dark:border-cream-100/10">
        <span className="text-navy-600 dark:text-cream-200/70">Total Bill</span>
        <span className="font-sans font-bold text-maroon-700 dark:text-gold-300">₹{order.total}</span>
      </div>
    </div>
  );
}

/* ============ ORDERS TAB ============ */
function OrdersTab({ orders, loading }: { orders: Order[]; loading: boolean }) {
  if (loading) return <LoadingSpinner />;
  if (orders.length === 0) return <EmptyState icon={ShoppingBag} title="No active orders" subtitle="Your current orders will appear here." />;

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="heading text-2xl lg:text-3xl">Active Orders</h1>
      {orders.map(o => <OrderTracker key={o.id} order={o} />)}
    </div>
  );
}

/* ============ HISTORY TAB ============ */
function HistoryTab({ orders, loading }: { orders: Order[]; loading: boolean }) {
  const { reorderLines } = useCart();
  const { navigate } = useRouter();

  if (loading) return <LoadingSpinner />;
  if (orders.length === 0) return <EmptyState icon={History} title="No order history" subtitle="Your past orders will show up here." />;

  const handleReorderOrder = (o: Order) => {
    if (o.lines && o.lines.length > 0) {
      reorderLines(o.lines);
      navigate('order');
    } else {
      navigate('menu');
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="heading text-2xl lg:text-3xl mb-5">Order History</h1>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans font-bold text-navy-900 dark:text-cream-50">Order #{o.orderNumber || o.id.slice(0, 8)}</p>
                <p className="text-xs text-navy-500 dark:text-cream-200/60">
                  {new Date(o.placedAt).toLocaleDateString()} at {new Date(o.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {o.tableNumber ? `Table ${o.tableNumber}` : 'Takeaway'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <button
                  onClick={() => handleReorderOrder(o)}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reorder
                </button>
              </div>
            </div>

            {/* Customization Details */}
            {o.lines && o.lines.length > 0 && (
              <div className="bg-cream-50 dark:bg-navy-800/50 p-3 rounded-xl space-y-2 text-xs">
                {o.lines.map((l: any, i: number) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-navy-900 dark:text-cream-50">{l.quantity}x {l.item?.name || 'Chai Item'}</span>
                      <p className="text-navy-600 dark:text-cream-200/70 text-[11px]">
                        Sugar: {l.customization?.sugarLevel || 'Medium'} · Milk: {l.customization?.milkType || 'Regular'} · Temp: {l.customization?.temperature || 'Hot'}
                        {l.customization?.notes ? ` · Note: ${l.customization.notes}` : ''}
                      </p>
                    </div>
                    <span className="font-sans font-bold text-maroon-700 dark:text-gold-300">₹{(l.item?.price || 0) * l.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 text-navy-600 dark:text-cream-200/70 border-t border-cream-200/40 dark:border-cream-100/10">
              <span>Total Paid</span>
              <span className="font-sans font-bold text-base text-maroon-700 dark:text-gold-300">₹{o.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ LOYALTY TAB ============ */
function LoyaltyTab({ profile }: { profile: any }) {
  const points = profile?.loyalty_points ?? 0;
  const tier = profile?.tier ?? 'Silver';
  const nextTier = tier === 'Silver' ? 'Gold' : tier === 'Gold' ? 'Platinum' : null;
  const nextTierPoints = tier === 'Silver' ? 500 : tier === 'Gold' ? 1000 : 0;
  const progress = nextTier ? Math.min(100, (points / nextTierPoints) * 100) : 100;

  const rewards = [
    { points: 10, label: 'Free Chai', icon: Coffee },
    { points: 25, label: '10% Discount', icon: Star },
    { points: 5, label: 'Free Samosa', icon: ShoppingBag },
    { points: 50, label: 'Birthday Bonus', icon: Gift },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="heading text-2xl lg:text-3xl">Loyalty Rewards</h1>

      <div className="card p-6 bg-gradient-to-br from-maroon-700 to-maroon-900 text-cream-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-300">Current Balance</p>
            <p className="font-sans font-extrabold text-4xl mt-1">{points} <span className="text-lg font-normal text-cream-200/80">points</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-300">Tier</p>
            <p className="font-sans font-bold text-xl mt-1 flex items-center gap-1">
              {tier} <Star className="w-4 h-4 fill-gold-300 text-gold-300" />
            </p>
          </div>
        </div>
        {nextTier && (
          <div>
            <div className="flex justify-between text-xs text-cream-200/80 mb-1.5">
              <span>Progress to {nextTier}</span>
              <span>{points} / {nextTierPoints}</span>
            </div>
            <div className="h-2 rounded-full bg-cream-200/20 overflow-hidden">
              <div className="h-full rounded-full bg-gold-400 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-cream-200/70 mt-1.5">{nextTierPoints - points} points to {nextTier}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-sans font-bold text-lg text-navy-900 dark:text-cream-50 mb-3">Available Rewards</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {rewards.map(r => {
            const canRedeem = points >= r.points;
            return (
              <div key={r.label} className="card p-4 flex items-center gap-3">
                <div className={`grid place-items-center w-11 h-11 rounded-xl ${canRedeem ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400' : 'bg-cream-100 dark:bg-navy-800 text-navy-400 dark:text-cream-200/40'}`}>
                  <r.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50">{r.label}</p>
                  <p className="text-xs text-navy-500 dark:text-cream-200/60">{r.points} points</p>
                </div>
                <button disabled={!canRedeem} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${canRedeem ? 'bg-maroon-700 text-cream-50 hover:bg-maroon-800' : 'bg-cream-100 dark:bg-navy-800 text-navy-400 dark:text-cream-200/40 cursor-not-allowed'}`}>
                  Redeem
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============ FAVORITES ============ */
function FavoritesTab() {
  return <EmptyState icon={Heart} title="No favorites yet" subtitle="Tap the heart icon on menu items to save them here." />;
}

/* ============ ADDRESSES ============ */
function AddressesTab({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'Home', full_address: '', city: '', pincode: '', phone: '' });

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('addresses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data) setAddresses(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await supabase.from('addresses').insert({ ...form, user_id: userId }).select().single();
    if (data) {
      setAddresses([data, ...addresses]);
      setShowForm(false);
      setForm({ label: 'Home', full_address: '', city: '', pincode: '', phone: '' });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="heading text-2xl lg:text-3xl">Address Book</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs py-2.5">
          <Plus className="w-3.5 h-3.5" /> Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Label (Home, Work)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="rounded-xl px-4 py-2.5 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50" />
            <input required placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="rounded-xl px-4 py-2.5 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50" />
          </div>
          <input required placeholder="Full address" value={form.full_address} onChange={e => setForm({ ...form, full_address: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50" />
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="rounded-xl px-4 py-2.5 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50" />
            <input required placeholder="Pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="rounded-xl px-4 py-2.5 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs py-2.5">Save Address</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-xs py-2.5">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses" subtitle="Add an address for faster checkout." />
      ) : (
        <div className="space-y-2">
          {addresses.map(a => (
            <div key={a.id} className="card p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-maroon-600 dark:text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50">{a.label}</p>
                  <p className="text-sm text-navy-600 dark:text-cream-200/70">{a.full_address}</p>
                  <p className="text-xs text-navy-400 dark:text-cream-200/50">{a.city} · {a.pincode} · {a.phone}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ PAYMENTS ============ */
function PaymentsTab() {
  const methods = [
    { id: 'upi', label: 'UPI', icon: '📱', connected: true },
    { id: 'gpay', label: 'Google Pay', icon: '💳', connected: true },
    { id: 'card', label: 'Credit Card', icon: '💳', connected: false },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="heading text-2xl lg:text-3xl">Payment Methods</h1>
      <div className="space-y-2">
        {methods.map(m => (
          <div key={m.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{m.icon}</span>
              <div>
                <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50">{m.label}</p>
                <p className="text-xs text-navy-500 dark:text-cream-200/60">{m.connected ? 'Connected' : 'Not connected'}</p>
              </div>
            </div>
            <button className={`text-xs font-semibold px-3 py-1.5 rounded-full ${m.connected ? 'bg-cream-100 dark:bg-navy-800 text-navy-600 dark:text-cream-200/70' : 'bg-maroon-700 text-cream-50'}`}>
              {m.connected ? 'Manage' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ SETTINGS ============ */
function SettingsTab({ profile, userId, email, refreshProfile }: { profile: any; userId: string; email: string; refreshProfile: () => Promise<void> }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', userId);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="heading text-2xl lg:text-3xl">Account Settings</h1>
      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-navy-500 dark:text-cream-200/60 mb-1.5">Full Name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-navy-500 dark:text-cream-200/60 mb-1.5">Email</label>
          <input value={email} disabled className="w-full rounded-xl px-4 py-2.5 text-sm bg-cream-100 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 text-navy-500 dark:text-cream-200/50" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-navy-500 dark:text-cream-200/60 mb-1.5">Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">Saved!</span>}
        </div>
      </form>
    </div>
  );
}

/* ============ SUPPORT ============ */
function SupportTab() {
  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="heading text-2xl lg:text-3xl">Help & Support</h1>
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300"><Phone className="w-5 h-5" /></div>
          <div>
            <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50">Call us</p>
            <p className="text-sm text-navy-600 dark:text-cream-200/70">+91 9852128128, +91 9121158128</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300"><Mail className="w-5 h-5" /></div>
          <div>
            <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50">Email</p>
            <p className="text-sm text-navy-600 dark:text-cream-200/70">Info@deccanchaiindia.com</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50">Operating Hours</p>
            <p className="text-sm text-navy-600 dark:text-cream-200/70">Mon - Sat: 9am - 7pm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ SHARED ============ */
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  const colors: Record<string, string> = {
    gold: 'bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400',
    maroon: 'bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300',
    navy: 'bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-cream-200',
  };
  return (
    <div className="card p-4">
      <div className={`grid place-items-center w-10 h-10 rounded-xl mb-2.5 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-sans font-extrabold text-2xl text-navy-900 dark:text-cream-50">{value}</p>
      <p className="text-xs text-navy-500 dark:text-cream-200/60">{label}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="mx-auto mb-2 grid place-items-center w-10 h-10 rounded-xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs font-semibold text-navy-700 dark:text-cream-200/70">{label}</p>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const displayStatus = (status === 'Received' || status === 'pending') ? 'Confirmed' : status;
  const colors: Record<string, string> = {
    Confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Received: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Preparing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Ready: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Served: 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-cream-200/60',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full text-[10px] font-bold px-2.5 py-1 ${colors[displayStatus] || colors.Confirmed}`}>{displayStatus}</span>;
}

function LoadingSpinner() {
  return <div className="grid place-items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div>;
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="text-center py-20">
      <Icon className="w-12 h-12 text-navy-300 dark:text-cream-200/20 mx-auto mb-3" />
      <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-1">{title}</h3>
      <p className="prose-body text-sm">{subtitle}</p>
    </div>
  );
}

// Need to import Phone, Mail for SupportTab
import { Phone, Mail } from 'lucide-react';

function MenuPreview({ navigate }: { navigate: (r: any) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data } = await supabase.from('menu_items').select('*').eq('available', true).order('sort_order').limit(4);
      if (data) setItems(data);
      setLoading(false);
    };
    fetchMenu();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-sans font-bold text-lg text-navy-900 dark:text-cream-50">Browse Menu</h2>
        <button onClick={() => navigate('menu')} className="text-sm text-maroon-700 dark:text-gold-300 font-medium hover:underline">View full menu</button>
      </div>
      {loading ? (
        <div className="card p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-maroon-700 mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <button key={item.id} onClick={() => navigate('order')} className="card overflow-hidden text-left hover:shadow-md transition-all">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={getImageUrl(item.name, item.image)} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <p className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50 line-clamp-1">{item.name}</p>
                <p className="text-xs text-navy-500 dark:text-cream-200/60">{item.category}</p>
                <p className="font-sans font-bold text-sm text-maroon-700 dark:text-gold-300 mt-1">₹{item.price}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
