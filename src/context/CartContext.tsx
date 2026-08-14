import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartLine, MenuItem, Customization, Order, OrderStatus } from '@/data/types';
import { supabase } from '@/lib/supabase';

interface CartContextValue {
  lines: CartLine[];
  tableNumber: number;
  setTableNumber: (n: number) => void;
  tableCount: number;
  setTableCount: (n: number) => void;
  addLine: (item: MenuItem, customization: Customization, quantity: number) => void;
  reorderLines: (newLines: CartLine[]) => void;
  removeLine: (uid: string) => void;
  updateQuantity: (uid: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  activeOrder: Order | null;
  placeOrder: (paymentMethod: string, tip: number, splitBetween: number) => Order;
  advanceOrder: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'deccan-chai-cart';
const ORDER_KEY = 'deccan-chai-order';

const defaultCustomization: Customization = {
  sugarLevel: 'Medium',
  milkType: 'Regular',
  temperature: 'Hot',
};

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function loadOrder(): Order | null {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}

const formatStatus = (s: string): OrderStatus => {
  const lower = (s || '').toLowerCase();
  if (lower === 'pending' || lower === 'received') return 'Received';
  if (lower === 'preparing') return 'Preparing';
  if (lower === 'ready') return 'Ready';
  if (lower === 'served' || lower === 'completed') return 'Served';
  if (lower === 'cancelled') return 'Cancelled';
  return 'Received';
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCart);
  const [tableNumber, setTableNumber] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('table');
    return t ? parseInt(t, 10) : 0;
  });
  const [tableCount, setTableCount] = useState<number>(() => {
    const saved = localStorage.getItem('deccan_store_tables');
    return saved ? parseInt(saved, 10) : 15;
  });
  const [activeOrder, setActiveOrder] = useState<Order | null>(loadOrder);

  // Sync outlet settings table count from Supabase
  useEffect(() => {
    const fetchOutletTables = async () => {
      const { data } = await supabase.from('outlets').select('id, dine_in').limit(1);
      const savedCount = localStorage.getItem('deccan_store_tables');
      if (savedCount) {
        setTableCount(parseInt(savedCount, 10));
      }
    };
    fetchOutletTables();

    const channel = supabase
      .channel('public:outlets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outlets' }, () => {
        const savedCount = localStorage.getItem('deccan_store_tables');
        if (savedCount) setTableCount(parseInt(savedCount, 10));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem(ORDER_KEY, JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem(ORDER_KEY);
    }
  }, [activeOrder]);

  // Real-time synchronization for active order from Supabase
  useEffect(() => {
    if (!activeOrder?.id) return;

    const channel = supabase
      .channel(`active-order-${activeOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload: any) => {
          if (payload.new && (payload.new.id === activeOrder.id || payload.new.order_number === activeOrder.id)) {
            const newStatus = formatStatus(payload.new.status);
            setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOrder?.id]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const addLine = useCallback((item: MenuItem, customization: Customization, quantity: number) => {
    setLines((prev) => {
      const uid = `${item.id}-${Date.now()}`;
      return [...prev, { uid, item, customization, quantity }];
    });
    setToastMessage(`Added ${quantity}x ${item.name} to cart`);
  }, []);

  const reorderLines = useCallback((newLines: CartLine[]) => {
    const formatted = newLines.map((l) => ({
      ...l,
      uid: `${l.item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    }));
    setLines(formatted);
    setToastMessage(`Added ${formatted.length} item(s) from previous order to cart`);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const removeLine = useCallback((uid: string) => {
    setLines((prev) => prev.filter((l) => l.uid !== uid));
  }, []);

  const updateQuantity = useCallback((uid: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.uid !== uid) : prev.map((l) => (l.uid === uid ? { ...l, quantity: qty } : l)),
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const subtotal = lines.reduce((sum, l) => sum + l.item.price * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  const placeOrder = useCallback(
    (paymentMethod: string, tip: number, splitBetween: number): Order => {
      const orderId = `DC${Date.now().toString().slice(-6)}`;
      const order: Order = {
        id: orderId,
        tableNumber: tableNumber || 1,
        lines,
        status: 'Received' as OrderStatus,
        placedAt: Date.now(),
        subtotal,
        tax: 0,
        total: subtotal + tip,
        tip,
        paymentMethod,
        paymentStatus: 'Paid' as const,
        splitBetween,
      };

      // Async insert order into Supabase
      (async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.id) {
            order.userId = userData.user.id;
            setActiveOrder({ ...order });
          }
          const { data: dbOrder, error } = await supabase
            .from('orders')
            .insert({
              order_number: orderId,
              user_id: userData?.user?.id || null,
              table_number: tableNumber || 1,
              status: 'Received',
              subtotal,
              tax: 0,
              tip,
              total: subtotal + tip,
              payment_method: paymentMethod,
              payment_status: 'Paid',
              split_between: splitBetween,
            })
            .select()
            .single();

          if (dbOrder && !error) {
            const orderItems = lines.map((l) => ({
              order_id: dbOrder.id,
              menu_item_id: l.item.id && l.item.id.length > 20 ? l.item.id : null,
              item_name: l.item.name,
              quantity: l.quantity,
              price: l.item.price,
              sugar_level: l.customization.sugarLevel || 'Medium',
              milk_type: l.customization.milkType || 'Regular',
              temperature: l.customization.temperature || 'Hot',
              notes: l.customization.notes || '',
            }));
            await supabase.from('order_items').insert(orderItems);
          }
        } catch {
          // Fallback gracefully if offline or RLS fails
        }
      })();

      setActiveOrder(order);
      setLines([]);
      return order;
    },
    [lines, tableNumber, subtotal],
  );

  const advanceOrder = useCallback(() => {
    setActiveOrder((prev) => {
      if (!prev) return null;
      const flow: OrderStatus[] = ['Received', 'Preparing', 'Ready', 'Served'];
      const idx = flow.indexOf(prev.status);
      if (idx < 0 || idx >= flow.length - 1) {
        localStorage.removeItem(ORDER_KEY);
        return null;
      }
      return { ...prev, status: flow[idx + 1] };
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        lines,
        tableNumber,
        setTableNumber,
        tableCount,
        setTableCount,
        addLine,
        reorderLines,
        removeLine,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        activeOrder,
        placeOrder,
        advanceOrder,
      }}
    >
      {children}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-navy-900 text-cream-50 px-4 py-3 rounded-2xl shadow-2xl border border-gold-400/30 animate-fade-up">
          <div className="w-8 h-8 rounded-full bg-gold-400 text-navy-950 grid place-items-center shrink-0 font-bold">
            ✓
          </div>
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => (window.location.hash = '#/order')}
            className="ml-2 text-xs font-bold bg-maroon-700 hover:bg-maroon-600 text-cream-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            View Order
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export { defaultCustomization };

