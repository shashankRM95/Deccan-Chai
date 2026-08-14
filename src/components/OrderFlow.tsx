import { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Clock, CheckCircle2, ChefHat, Bell, CreditCard, Smartphone, Wallet, SplitSquareHorizontal, Star, MapPin, X, Loader2, Coffee, Lock } from 'lucide-react';
import { useCart, defaultCustomization } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/router';
import { categoryOrder, categoryMeta } from '@/data/menu';
import { supabase } from '@/lib/supabase';
import type { MenuCategory, MenuItem, Customization, OrderStatus } from '@/data/types';
import { CustomizeSheet } from '@/components/CustomizeSheet';
import { getImageUrl } from '@/getImageUrl';

type View = 'menu' | 'cart';

export function OrderFlow({ initialView = 'menu' }: { initialView?: View }) {
  const { lines, tableNumber, setTableNumber, addLine, removeLine, updateQuantity, subtotal, itemCount, placeOrder, activeOrder, advanceOrder, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [activeCat, setActiveCat] = useState<MenuCategory | 'All'>('All');
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isCustomerLoggedIn = !!user && profile?.role !== 'owner';
  const isOwner = profile?.role === 'owner';

  // Sync view when initialView changes (e.g. navigating with ?view=cart)
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase.from('menu_items').select('*').eq('available', true).order('sort_order');
      if (error) {
        setErrorMsg(error.message || JSON.stringify(error));
      } else if (data) {
        setAllItems(data.map((d: any) => ({
          id: d.id, name: d.name, category: d.category as MenuCategory,
          price: parseFloat(d.price), description: d.description, prepTime: d.prep_time,
          image: d.image, popular: d.popular, available: d.available,
        })));
      }
      setItemsLoading(false);
    };
    fetchMenu();
  }, []);

  const filtered = useMemo(() => {
    return allItems.filter((m: MenuItem) => activeCat === 'All' || m.category === activeCat);
  }, [allItems, activeCat]);

  const handleQuickAdd = (item: MenuItem) => {
    addLine(item, { ...defaultCustomization, temperature: item.category === 'Chillers' || item.category === 'Mojitos' || item.category === 'Milk Shakes' || item.category === 'Lassies' ? 'Cold' : 'Hot' }, 1);
  };

  if (activeOrder) {
    return <OrderTracking order={activeOrder} onAdvance={advanceOrder} onBackHome={() => navigate('home')} />;
  }

  return (
    <div className="pt-16 lg:pt-20 bg-grain min-h-screen pb-24 lg:pb-0">
      {/* Table banner */}
      {tableNumber > 0 && (
        <div className="bg-maroon-700 text-cream-50">
          <div className="container-px mx-auto max-w-7xl py-2.5 flex items-center justify-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gold-300" />
            <span>Dining at</span>
            <span className="font-bold">Table {tableNumber}</span>
            <span className="text-cream-200/60">· Jubilee Hills outlet</span>
          </div>
        </div>
      )}

      {!isCustomerLoggedIn && !isOwner && (
        <div className="bg-gold-400 text-navy-950 px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Please log in to your customer account to customize & order items.</span>
          <button onClick={() => navigate('customer-login')} className="ml-2 underline font-bold hover:text-maroon-900">
            Login
          </button>
        </div>
      )}

      {/* Toggle buttons: Order on Table | Cart */}
      <div className="sticky top-16 lg:top-20 z-30 glass border-b border-cream-300/40 dark:border-cream-100/10">
        <div className="container-px mx-auto max-w-7xl py-3 flex items-center gap-2">
          <button
            onClick={() => setView('menu')}
            className={`flex-1 sm:flex-none sm:px-6 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${view === 'menu'
              ? 'bg-maroon-700 text-cream-50 shadow-md shadow-maroon-900/20'
              : 'bg-cream-100 dark:bg-navy-800 text-navy-500 dark:text-cream-200/50 hover:bg-cream-200 dark:hover:bg-navy-700'
              }`}
          >
            <Coffee className="w-4 h-4" />
            Order on Table
          </button>
          <button
            onClick={() => setView('cart')}
            className={`flex-1 sm:flex-none sm:px-6 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all relative ${view === 'cart'
              ? 'bg-maroon-700 text-cream-50 shadow-md shadow-maroon-900/20'
              : 'bg-cream-100 dark:bg-navy-800 text-navy-500 dark:text-cream-200/50 hover:bg-cream-200 dark:hover:bg-navy-700'
              }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Cart
            {itemCount > 0 && (
              <span className={`grid place-items-center min-w-[20px] h-5 px-1 rounded-full text-[10px] font-bold ${view === 'cart' ? 'bg-gold-400 text-navy-900' : 'bg-maroon-700 text-cream-50'}`}>
                {itemCount}
              </span>
            )}
          </button>

          {/* Category tabs — only in menu view */}
          {view === 'menu' && (
            <div className="hidden lg:flex items-center gap-1.5 ml-3 overflow-x-auto scrollbar-hide">
              <CatTab label="All" active={activeCat === 'All'} onClick={() => setActiveCat('All')} />
              {categoryOrder.map((cat) => (
                <CatTab key={cat} label={`${categoryMeta[cat].icon} ${cat}`} active={activeCat === cat} onClick={() => setActiveCat(cat)} />
              ))}
            </div>
          )}
        </div>

        {/* Mobile category tabs */}
        {view === 'menu' && (
          <div className="lg:hidden container-px mx-auto pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <CatTab label="All" active={activeCat === 'All'} onClick={() => setActiveCat('All')} />
            {categoryOrder.map((cat) => (
              <CatTab key={cat} label={`${categoryMeta[cat].icon} ${cat}`} active={activeCat === cat} onClick={() => setActiveCat(cat)} />
            ))}
          </div>
        )}
      </div>

      {/* MENU VIEW */}
      {view === 'menu' && (
        <section className="container-px mx-auto max-w-7xl py-6">
          {itemsLoading ? (
            <div className="grid place-items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div>
          ) : errorMsg ? (
            <div className="text-center py-20 text-red-500 font-bold bg-white p-4 rounded-lg">
              Error fetching menu: {errorMsg}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item: MenuItem) => (
                <div key={item.id} className="card group overflow-hidden flex flex-col hover:shadow-md transition-all">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={getImageUrl(item.name, item.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    {item.popular && (
                      <span className="absolute top-2 left-2 rounded-full bg-gold-400 text-navy-900 text-[9px] font-bold px-2 py-0.5 uppercase">
                        Popular
                      </span>
                    )}
                    <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full glass px-2 py-0.5 text-[10px] font-medium">
                      <Clock className="w-2.5 h-2.5" /> {item.prepTime}m
                    </div>
                  </div>
                  <div className="p-3.5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50 leading-tight">{item.name}</h3>
                      <span className="font-sans font-bold text-sm text-maroon-700 dark:text-gold-300 whitespace-nowrap">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-navy-600 dark:text-cream-200/70 leading-relaxed mb-3 flex-1 line-clamp-2">{item.description}</p>
                    {isCustomerLoggedIn ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => setSheetItem(item)} className="flex-1 text-xs py-2 rounded-full border border-maroon-700/20 dark:border-cream-100/10 text-maroon-800 dark:text-cream-200 hover:bg-maroon-50 dark:hover:bg-navy-800 transition-colors font-medium">
                          Customize
                        </button>
                        <button onClick={() => handleQuickAdd(item)} className="btn-primary text-xs py-2 px-3">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : isOwner ? (
                      <div className="text-xs text-navy-400 dark:text-cream-200/40 text-center py-2 bg-cream-100 dark:bg-navy-800 rounded-full font-medium">
                        Owner Dashboard View
                      </div>
                    ) : (
                      <button onClick={() => navigate('customer-login')} className="w-full btn-outline text-xs py-2 rounded-full font-semibold flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-gold-600" />
                        Login to Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* CART VIEW */}
      {view === 'cart' && (
        <section className="container-px mx-auto max-w-3xl py-6 lg:py-10">
          {/* Cart header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="grid place-items-center w-12 h-12 rounded-2xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="heading text-2xl">Your Cart</h1>
              <p className="text-sm text-navy-500 dark:text-cream-200/60">
                Table {tableNumber || 1} · {itemCount} item{itemCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {lines.length === 0 ? (
            <div className="card p-10 text-center">
              <ShoppingBag className="w-12 h-12 text-navy-300 dark:text-cream-200/20 mx-auto mb-4" />
              <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-1">Your cart is empty</h3>
              <p className="prose-body text-sm mb-5">Browse the menu and add items to get started.</p>
              <button onClick={() => setView('menu')} className="btn-primary">
                <Coffee className="w-4 h-4" /> Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="space-y-3 mb-6">
                {lines.map((line) => (
                  <div key={line.uid} className="card p-4 flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img src={getImageUrl(line.item.name, line.item.image)} alt={line.item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50">{line.item.name}</h4>
                        <button onClick={() => removeLine(line.uid)} aria-label="Remove" className="text-navy-400 hover:text-red-500 dark:text-cream-200/40 dark:hover:text-red-400 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-navy-500 dark:text-cream-200/60 mb-2">
                        {line.customization.sugarLevel && `${line.customization.sugarLevel} sugar`}
                        {line.customization.milkType && line.customization.milkType !== 'Regular' && ` · ${line.customization.milkType} milk`}
                        {line.customization.temperature && ` · ${line.customization.temperature}`}
                        {line.customization.thickness && ` · ${line.customization.thickness}`}
                        {line.customization.toppings && line.customization.toppings !== 'None' && ` · ${line.customization.toppings}`}
                        {line.customization.iceLevel && ` · ${line.customization.iceLevel} ice`}
                        {line.customization.freshMint === false && ' · no mint'}
                        {line.customization.notes && ` · ${line.customization.notes}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(line.uid, line.quantity - 1)} aria-label="Decrease" className="grid place-items-center w-7 h-7 rounded-full border border-navy-900/10 dark:border-cream-100/10 hover:bg-cream-100 dark:hover:bg-navy-800">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{line.quantity}</span>
                          <button onClick={() => updateQuantity(line.uid, line.quantity + 1)} aria-label="Increase" className="grid place-items-center w-7 h-7 rounded-full border border-navy-900/10 dark:border-cream-100/10 hover:bg-cream-100 dark:hover:bg-navy-800">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-sans font-bold text-sm text-maroon-700 dark:text-gold-300">₹{line.item.price * line.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price breakdown — TAX REMOVED */}
              <div className="card p-5 mb-4">
                <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-sans font-bold text-base text-navy-900 dark:text-cream-50 pt-2 border-t border-cream-200/50 dark:border-cream-100/10">
                    <span>Total Payable</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button onClick={() => setView('menu')} className="btn-outline flex-1">
                  <ArrowLeft className="w-4 h-4" /> Add More
                </button>
                <button onClick={() => setCheckoutOpen(true)} className="btn-primary flex-1">
                  Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Floating cart bar (mobile, menu view) */}
      {view === 'menu' && itemCount > 0 && isCustomerLoggedIn && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden p-3">
          <button onClick={() => setView('cart')} className="w-full btn-primary shadow-2xl shadow-maroon-900/40 py-4">
            <ShoppingBag className="w-5 h-5" />
            View Cart · {itemCount} item{itemCount !== 1 ? 's' : ''} · ₹{subtotal}
          </button>
        </div>
      )}

      {/* Checkout */}
      {checkoutOpen && (
        <CheckoutModal
          subtotal={subtotal}
          tableNumber={tableNumber || 1}
          onClose={() => setCheckoutOpen(false)}
          onPlace={placeOrder}
          onPlaced={() => setCheckoutOpen(false)}
        />
      )}

      {/* Customize sheet */}
      {sheetItem && isCustomerLoggedIn && (
        <CustomizeSheet
          item={sheetItem}
          onClose={() => setSheetItem(null)}
          onAdd={(item, c, q) => {
            addLine(item, c, q);
            setSheetItem(null);
          }}
        />
      )}
    </div>
  );
}


function CatTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${active ? 'bg-maroon-700 text-cream-50 shadow-sm' : 'bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-navy-700'
        }`}
    >
      {label}
    </button>
  );
}

function CheckoutModal({
  subtotal,
  tableNumber,
  onClose,
  onPlace,
  onPlaced,
}: {
  subtotal: number;
  tableNumber: number;
  onClose: () => void;
  onPlace: (paymentMethod: string, tip: number, splitBetween: number) => import('@/data/types').Order;
  onPlaced: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [tipPct, setTipPct] = useState(0);
  const [split, setSplit] = useState(1);

  const tip = Math.round((subtotal * tipPct) / 100);
  const total = subtotal + tip;
  const perPerson = Math.ceil(total / split);

  const payments = [
    { id: 'Cash', label: 'Cash', icon: Wallet },
  ];

  const tips = [0, 5, 10, 15];

  const handlePlace = () => {
    onPlace(paymentMethod, tip, split);
    onPlaced();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-navy-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-cream-300/40 dark:border-cream-100/10 bg-white dark:bg-navy-900 z-10">
          <h3 className="font-sans font-bold text-lg text-navy-900 dark:text-cream-50">Checkout</h3>
          <button onClick={onClose} aria-label="Close" className="grid place-items-center w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-navy-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Table info */}
          <div className="flex items-center justify-between rounded-xl bg-cream-100 dark:bg-navy-800 p-3">
            <span className="flex items-center gap-2 text-sm text-navy-600 dark:text-cream-200/70">
              <MapPin className="w-4 h-4 text-maroon-700 dark:text-gold-300" />
              Table {tableNumber || 1} · Jubilee Hills
            </span>
            <span className="text-sm font-semibold text-navy-900 dark:text-cream-50">₹{subtotal}</span>
          </div>

          {/* Split bill */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-navy-500 dark:text-cream-200/60 mb-2.5 flex items-center gap-1.5">
              <SplitSquareHorizontal className="w-3.5 h-3.5" />
              Split Bill
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setSplit((s) => Math.max(1, s - 1))} disabled={split <= 1} aria-label="Fewer people" className="grid place-items-center w-9 h-9 rounded-full border border-navy-900/10 dark:border-cream-100/10 disabled:opacity-40 hover:bg-cream-100 dark:hover:bg-navy-800">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-sans font-bold text-lg">{split}</span>
              <button onClick={() => setSplit((s) => Math.min(10, s + 1))} disabled={split >= 10} aria-label="More people" className="grid place-items-center w-9 h-9 rounded-full border border-navy-900/10 dark:border-cream-100/10 disabled:opacity-40 hover:bg-cream-100 dark:hover:bg-navy-800">
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-navy-500 dark:text-cream-200/60 ml-2">people · ₹{perPerson}/person</span>
            </div>
          </div>

          {/* Tip */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-navy-500 dark:text-cream-200/60 mb-2.5 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" />
              Add a Tip
            </p>
            <div className="flex gap-2">
              {tips.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipPct(t)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${tipPct === t ? 'bg-maroon-700 text-cream-50 shadow-sm' : 'bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-navy-700'
                    }`}
                >
                  {t === 0 ? 'No tip' : `${t}%`}
                </button>
              ))}
            </div>
          </div>


          {/* Summary */}
          <div className="rounded-xl border border-cream-300/40 dark:border-cream-100/10 p-4 space-y-2 text-sm">
            <div className="flex justify-between font-sans font-bold text-base text-navy-900 dark:text-cream-50">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            {split > 1 && (
              <div className="flex justify-between text-maroon-700 dark:text-gold-300 font-semibold">
                <span>Per person ({split})</span>
                <span>₹{perPerson}</span>
              </div>
            )}
          </div>

          <button onClick={handlePlace} className="btn-primary w-full py-4">
            Place Order · ₹{total}
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-xs text-navy-400 dark:text-cream-200/50">
            By placing this order you agree to our terms. Payment is processed securely.
          </p>
        </div>
      </div>
    </div>
  );
}

function OrderTracking({
  order,
  onAdvance,
  onBackHome,
}: {
  order: import('@/data/types').Order;
  onAdvance: () => void;
  onBackHome: () => void;
}) {
  const statuses: { status: OrderStatus; label: string; icon: typeof CheckCircle2; desc: string }[] = [
    { status: 'Received', label: 'Order Received', icon: CheckCircle2, desc: 'Your order is confirmed and sent to the kitchen.' },
    { status: 'Preparing', label: 'Preparing', icon: ChefHat, desc: 'Our chai-walas are brewing your order with care.' },
    { status: 'Ready', label: 'Ready to Serve', icon: Bell, desc: 'Your order is ready! A server will bring it to your table.' },
    { status: 'Served', label: 'Served', icon: CheckCircle2, desc: 'Enjoy your Deccan Chai. Thank you for dining with us!' },
  ];

  const currentIdx = statuses.findIndex((s) => s.status === order.status);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="pt-20 lg:pt-24 bg-grain min-h-screen">
      <section className="container-px mx-auto max-w-2xl py-12 lg:py-16">
        {/* Order header */}
        <div className="text-center mb-10">
          <div className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-maroon-700 text-gold-300 mb-4 shadow-lg shadow-maroon-900/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="section-label justify-center">Order #{order.id}</p>
          <h1 className="heading text-3xl lg:text-4xl mt-2 mb-2">
            {order.status === 'Served' ? 'Enjoy your moment!' : 'Your order is on the way.'}
          </h1>
          <p className="prose-body text-sm">
            Table {order.tableNumber} · {order.lines.reduce((s, l) => s + l.quantity, 0)} items · ₹{order.total}
          </p>
        </div>

        {/* Status tracker */}
        <div className="card p-6 lg:p-8 mb-6">
          <div className="relative">
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-cream-200 dark:bg-navy-700 rounded-full" />
            <div
              className="absolute top-6 left-6 h-0.5 bg-maroon-700 dark:bg-gold-400 rounded-full transition-all duration-500"
              style={{ width: `calc((100% - 3rem) * ${Math.min(currentIdx, statuses.length - 1) / (statuses.length - 1)})` }}
            />
            <div className="relative flex justify-between">
              {statuses.map((s, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s.status} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`grid place-items-center w-12 h-12 rounded-full transition-all duration-500 ${done
                        ? 'bg-maroon-700 dark:bg-gold-400 text-cream-50 dark:text-navy-900 shadow-lg'
                        : 'bg-cream-200 dark:bg-navy-700 text-navy-400 dark:text-cream-200/40'
                        } ${active ? 'ring-4 ring-gold-400/30 scale-110' : ''}`}
                    >
                      <s.icon className="w-5 h-5" />
                    </div>
                    <p className={`text-xs font-semibold text-center ${done ? 'text-navy-900 dark:text-cream-50' : 'text-navy-400 dark:text-cream-200/40'}`}>
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="prose-body text-sm">{statuses[currentIdx]?.desc}</p>
            <p className="text-xs text-navy-400 dark:text-cream-200/50 mt-2">
              Placed at {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {order.status !== 'Served' && (
            <button onClick={onAdvance} className="btn-outline w-full mt-6 text-xs">
              Simulate status update (demo)
            </button>
          )}
        </div>

        {/* Order items */}
        <div className="card p-5 mb-6">
          <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-3">Order Details</h3>
          <div className="space-y-2">
            {order.lines.map((line) => (
              <div key={line.uid} className="flex items-center justify-between text-sm py-2 border-b border-cream-200/50 dark:border-cream-100/5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-navy-900 dark:text-cream-50">{line.quantity}×</span>
                  <span className="text-navy-700 dark:text-cream-200/80">{line.item.name}</span>
                </div>
                <span className="font-medium text-navy-700 dark:text-cream-200/80">₹{line.item.price * line.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-200/50 dark:border-cream-100/10">
            <span className="font-sans font-bold text-navy-900 dark:text-cream-50">Total Bill Amount</span>
            <span className="font-sans font-bold text-maroon-700 dark:text-gold-300">₹{order.total}</span>
          </div>
        </div>

        {/* Feedback */}
        {order.status === 'Served' && !submitted && (
          <div className="card p-6">
            <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-1">How was your chai?</h3>
            <p className="prose-body text-sm mb-4">Your feedback helps us brew better.</p>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`Rate ${n} stars`} className="transition-transform hover:scale-110">
                  <Star className={`w-7 h-7 ${n <= rating ? 'fill-gold-400 text-gold-400' : 'text-navy-300 dark:text-cream-200/30'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50 resize-none mb-3"
            />
            <button onClick={() => setSubmitted(true)} disabled={rating === 0} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Feedback
            </button>
          </div>
        )}

        {submitted && (
          <div className="card p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-1">Thank you!</h3>
            <p className="prose-body text-sm">Your feedback has been recorded. We hope to brew for you again soon.</p>
          </div>
        )}

        <button onClick={onBackHome} className="btn-ghost w-full mt-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </section>
    </div>
  );
}
