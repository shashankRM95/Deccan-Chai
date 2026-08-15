import { useState, useEffect, useMemo } from 'react';
import { MapPin, Check, Plus, Minus, Trash2, ShoppingBag, Clock, Coffee, Loader2, ArrowRight, SplitSquareHorizontal, UserCheck, Lock } from 'lucide-react';
import { useCart, defaultCustomization } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/router';
import { supabase } from '@/lib/supabase';
import { categoryOrder, categoryMeta } from '@/data/menu';
import type { MenuCategory, MenuItem } from '@/data/types';
import { getImageUrl } from '@/getImageUrl';
import { CustomizeSheet } from '@/components/CustomizeSheet';
import { OrderFlow } from '@/components/OrderFlow';
import { SignInPromptModal } from '@/components/SignInPromptModal';

export function OrderPage() {
  const { tableNumber, setTableNumber, lines, activeOrder, addLine, removeLine, updateQuantity, itemCount, subtotal, placeOrder } = useCart();
  const { user, profile } = useAuth();
  const { navigate, params } = useRouter();
  const [selectedTable, setSelectedTable] = useState<number>(tableNumber || 1);
  const [tableCount, setTableCount] = useState<number>(15);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<MenuCategory | 'All'>('All');
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [splitCount, setSplitCount] = useState<number>(1);
  const [orderErr, setOrderErr] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const role = profile?.role || localStorage.getItem('role') || '';
  const isCustomerLoggedIn = !!user && role === 'customer';
  const isOwner = role === 'owner';

  useEffect(() => {
    if (!tableNumber) {
      setTableNumber(1);
    }
  }, [tableNumber, setTableNumber]);

  return <OrderPageInner
    tableNumber={tableNumber || selectedTable}
    setTableNumber={setTableNumber}
    selectedTable={selectedTable}
    setSelectedTable={setSelectedTable}
    tableCount={tableCount}
    setTableCount={setTableCount}
    allItems={allItems}
    setAllItems={setAllItems}
    itemsLoading={itemsLoading}
    setItemsLoading={setItemsLoading}
    activeCat={activeCat}
    setActiveCat={setActiveCat}
    sheetItem={sheetItem}
    setSheetItem={setSheetItem}
    lines={lines}
    activeOrder={activeOrder}
    addLine={addLine}
    removeLine={removeLine}
    updateQuantity={updateQuantity}
    itemCount={itemCount}
    subtotal={subtotal}
    placeOrder={placeOrder}
    navigate={navigate}
    params={params}
    isCustomerLoggedIn={isCustomerLoggedIn}
    isOwner={isOwner}
    splitCount={splitCount}
    setSplitCount={setSplitCount}
    orderErr={orderErr}
    setOrderErr={setOrderErr}
    showSignInModal={showSignInModal}
    setShowSignInModal={setShowSignInModal}
  />;
}

function OrderPageInner({
  tableNumber, setTableNumber, selectedTable, setSelectedTable, tableCount, setTableCount,
  allItems, setAllItems, itemsLoading, setItemsLoading, activeCat, setActiveCat, sheetItem,
  setSheetItem, lines, activeOrder, addLine, removeLine, updateQuantity, itemCount, subtotal, placeOrder,
  navigate, isCustomerLoggedIn, isOwner, splitCount, setSplitCount, orderErr, setOrderErr,
  showSignInModal, setShowSignInModal
}: any) {

  useEffect(() => {
    // Fetch table count from outlets
    supabase.from('outlets').select('table_count').limit(1).maybeSingle().then(({ data }) => {
      if (data?.table_count) setTableCount(data.table_count);
    });

    // Fetch menu items
    supabase.from('menu_items').select('*').eq('available', true).order('sort_order').then(({ data }) => {
      if (data) {
        setAllItems(data.map((d: any) => ({
          id: d.id, name: d.name, category: d.category as MenuCategory,
          price: parseFloat(d.price), description: d.description, prepTime: d.prep_time,
          image: d.image, popular: d.popular, available: d.available,
        })));
      }
      setItemsLoading(false);
    });
  }, []);

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const filtered = useMemo(() =>
    allItems.filter((m: MenuItem) => activeCat === 'All' || m.category === activeCat),
    [allItems, activeCat]
  );

  const handleSelectTable = (t: number) => {
    setSelectedTable(t);
    setTableNumber(t);
  };

  const handleQuickAdd = (item: MenuItem) => {
    setOrderErr(null);
    addLine(item, { ...defaultCustomization, temperature: ['Chillers', 'Mojitos', 'Milk Shakes', 'Lassies'].includes(item.category) ? 'Cold' : 'Hot' }, 1);
  };

  const handlePlaceOrder = () => {
    setOrderErr(null);
    if (lines.length === 0) {
      setOrderErr('Please add some items to your order first.');
      return;
    }
    placeOrder('Cash', 0, splitCount);
  };

  const perPerson = splitCount > 1 ? Math.ceil(subtotal / splitCount) : subtotal;

  return (
    <div className="pt-20 lg:pt-24 bg-grain min-h-screen pb-16">
      {/* Top Banner Notice */}
      {!isCustomerLoggedIn && !isOwner && (
        <div className="bg-gold-400 text-navy-950 px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Log into your customer account to customize & place table orders.</span>
          <button onClick={() => setShowSignInModal(true)} className="ml-2 underline font-bold hover:text-maroon-900">
            Login / Sign Up
          </button>
        </div>
      )}

      {isOwner && (
        <div className="bg-navy-800 text-gold-300 px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b border-gold-400/20">
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Logged in as Store Owner. Switch to a customer account to test table ordering.</span>
        </div>
      )}

      <div className="container-px mx-auto max-w-7xl pt-4 pb-6 space-y-6">

        {/* ===== HORIZONTAL TABLE SELECTION BAR ABOVE MENU ===== */}
        {!isOwner && (
        <div className="card p-4 sm:p-5 bg-white dark:bg-navy-900 shadow-sm border border-cream-300/40 dark:border-cream-100/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center w-8 h-8 rounded-full bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-base text-navy-900 dark:text-cream-50">Select Your Table Number</h2>
                <p className="text-xs text-navy-500 dark:text-cream-200/60">Tap a table number below to order for your table</p>
              </div>
            </div>
            {selectedTable > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-maroon-50 dark:bg-navy-800 text-maroon-800 dark:text-gold-300 text-xs font-bold self-start sm:self-auto border border-maroon-200 dark:border-gold-500/20">
                <Check className="w-3.5 h-3.5 text-gold-500" />
                Table {selectedTable} Selected
              </span>
            )}
          </div>

          {/* Horizontal Table Buttons Row */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {tables.map((t) => (
              <button
                key={t}
                onClick={() => handleSelectTable(t)}
                className={`relative shrink-0 min-w-[50px] sm:min-w-[60px] h-12 rounded-xl font-sans font-extrabold text-base flex flex-col items-center justify-center transition-all ${
                  selectedTable === t
                    ? 'bg-maroon-700 text-cream-50 shadow-md shadow-maroon-900/30 scale-105 ring-2 ring-gold-400'
                    : 'bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-navy-700'
                }`}
              >
                <span className="text-[10px] uppercase font-normal text-cream-200/80 leading-none">Table</span>
                <span className="leading-tight">{t}</span>
                {selectedTable === t && (
                  <span className="absolute -top-1 -right-1 grid place-items-center w-4 h-4 rounded-full bg-gold-400 text-navy-900">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* ===== HORIZONTAL YOUR ORDER CART PANEL (DIRECTLY BELOW TABLE SECTION) ===== */}
        {/* Placed Order Items Bar */}
        {activeOrder && isCustomerLoggedIn && (
          <div className="card p-4 sm:p-5 bg-gradient-to-r from-maroon-900 to-navy-900 text-cream-50 shadow-lg border-2 border-gold-400/40 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cream-100/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center w-9 h-9 rounded-full bg-gold-400 text-navy-950 font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-cream-50 flex items-center gap-2">
                    Active Placed Order #{activeOrder.orderNumber || activeOrder.id?.toString().slice(-6).toUpperCase()}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-400 text-navy-950 font-extrabold uppercase">
                      {activeOrder.status || 'Received'}
                    </span>
                  </h3>
                  <p className="text-xs text-cream-200/80">Table {activeOrder.tableNumber || selectedTable} · Order placed & brewing!</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Split Bill */}
                <div className="flex items-center gap-2 bg-navy-950/60 px-3 py-1.5 rounded-xl text-xs border border-white/10">
                  <span className="flex items-center gap-1 font-semibold text-gold-300">
                    <SplitSquareHorizontal className="w-3.5 h-3.5" /> Split Bill:
                  </span>
                  <button onClick={() => setSplitCount((s: number) => Math.max(1, s - 1))} className="w-6 h-6 rounded bg-navy-800 font-bold grid place-items-center hover:bg-navy-700">-</button>
                  <span className="font-bold text-cream-50">{splitCount} person{splitCount > 1 ? 's' : ''}</span>
                  <button onClick={() => setSplitCount((s: number) => Math.min(10, s + 1))} className="w-6 h-6 rounded bg-navy-800 font-bold grid place-items-center hover:bg-cream-700">+</button>
                </div>

                <div className="text-right">
                  <p className="text-xs text-cream-200/60">Total Order Amount</p>
                  <p className="font-sans font-extrabold text-lg text-gold-300">₹{activeOrder.total}</p>
                  {splitCount > 1 && <p className="text-[10px] text-gold-400 font-bold">₹{Math.ceil(activeOrder.total / splitCount)} / person</p>}
                </div>

                <button onClick={() => navigate('customer-dashboard')} className="btn-primary text-xs py-2 px-4 font-bold">
                  Track Live Order
                </button>
              </div>
            </div>

            {/* Placed Order Items List Chips */}
            <div>
              <p className="text-xs font-semibold text-gold-300 mb-2">Ordered Items ({activeOrder.lines?.length || 0} items):</p>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
                {activeOrder.lines?.map((line: any, idx: number) => (
                  <div key={line.uid || idx} className="shrink-0 flex items-center gap-3 bg-navy-950/80 px-3.5 py-2 rounded-xl border border-gold-400/20">
                    <img src={getImageUrl(line.item?.name || line.name, line.item?.image || line.image)} alt={line.item?.name || line.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-bold text-cream-50 truncate max-w-[140px]">{line.item?.name || line.name}</p>
                      <p className="text-[11px] text-gold-300 font-semibold">₹{line.item?.price || line.price} × {line.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Draft Cart Items Bar */}
        {lines.length > 0 && isCustomerLoggedIn && (
          <div className="card p-4 sm:p-5 bg-white dark:bg-navy-900 shadow-md border-2 border-maroon-700/30 dark:border-gold-400/30 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cream-200/50 dark:border-cream-100/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center w-9 h-9 rounded-full bg-maroon-700 text-gold-300">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-navy-900 dark:text-cream-50 flex items-center gap-2">
                    Your Order Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-cream-200/60">Table {selectedTable} · Review order items below</p>
                </div>
              </div>

              {/* Controls, Subtotal & Action */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Split Bill */}
                <div className="flex items-center gap-2 bg-cream-100 dark:bg-navy-800 px-3 py-1.5 rounded-xl text-xs">
                  <span className="flex items-center gap-1 font-semibold text-navy-700 dark:text-cream-200/80">
                    <SplitSquareHorizontal className="w-3.5 h-3.5 text-maroon-700 dark:text-gold-300" /> Split Bill:
                  </span>
                  <button onClick={() => setSplitCount((s: number) => Math.max(1, s - 1))} className="w-6 h-6 rounded bg-cream-200 dark:bg-navy-700 font-bold grid place-items-center hover:bg-cream-300">-</button>
                  <span className="font-bold text-navy-900 dark:text-cream-50">{splitCount} person{splitCount > 1 ? 's' : ''}</span>
                  <button onClick={() => setSplitCount((s: number) => Math.min(10, s + 1))} className="w-6 h-6 rounded bg-cream-200 dark:bg-navy-700 font-bold grid place-items-center hover:bg-cream-300">+</button>
                </div>

                <div className="text-right">
                  <p className="text-xs text-navy-500 dark:text-cream-200/60">Total Payable</p>
                  <p className="font-sans font-extrabold text-lg text-maroon-700 dark:text-gold-300">₹{subtotal.toFixed(0)}</p>
                  {splitCount > 1 && <p className="text-[10px] text-gold-600 font-bold">₹{perPerson.toFixed(0)} / person</p>}
                </div>

                <button onClick={handlePlaceOrder} className="btn-primary text-sm py-2.5 px-6 font-bold flex items-center gap-2">
                  Place Order · Table {selectedTable} · ₹{subtotal.toFixed(0)}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Items Chips */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
              {lines.map((line: any) => (
                <div key={line.uid} className="shrink-0 flex items-center gap-3 bg-cream-50 dark:bg-navy-800 px-3 py-2 rounded-xl border border-cream-200/60 dark:border-cream-100/10">
                  <img src={getImageUrl(line.item.name, line.item.image)} alt={line.item.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-xs font-bold text-navy-900 dark:text-cream-50 truncate max-w-[130px]">{line.item.name}</p>
                    <p className="text-[11px] text-maroon-700 dark:text-gold-300 font-semibold">₹{line.item.price} × {line.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-1">
                    <button onClick={() => updateQuantity(line.uid, line.quantity - 1)} className="grid place-items-center w-5 h-5 rounded-full border border-navy-900/10 hover:bg-cream-200 dark:hover:bg-navy-700">
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{line.quantity}</span>
                    <button onClick={() => updateQuantity(line.uid, line.quantity + 1)} className="grid place-items-center w-5 h-5 rounded-full border border-navy-900/10 hover:bg-cream-200 dark:hover:bg-navy-700">
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button onClick={() => removeLine(line.uid)} className="text-red-400 hover:text-red-600 ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {orderErr && <p className="text-xs text-red-500 font-medium">{orderErr}</p>}
          </div>
        )}

        {/* ===== MENU ITEMS SECTION (FULL WIDTH) ===== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="heading text-2xl lg:text-3xl">Menu</h1>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
            {['All', ...categoryOrder].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat as MenuCategory | 'All')}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeCat === cat ? 'bg-maroon-700 text-cream-50 shadow-sm' : 'bg-cream-100 dark:bg-navy-800 text-navy-600 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-navy-700'}`}
              >
                {cat === 'All' ? 'All' : `${(categoryMeta as any)[cat]?.icon || ''} ${cat}`}
              </button>
            ))}
          </div>

          {itemsLoading ? (
            <div className="grid place-items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-maroon-700" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-navy-400 dark:text-cream-200/40">
              <Coffee className="w-10 h-10 mx-auto mb-3" />
              <p>No items in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filtered.map((item: MenuItem) => {
                const cartQty = lines.filter((l: any) => l.item.id === item.id).reduce((s: number, l: any) => s + l.quantity, 0);
                return (
                  <div key={item.id} className="card group overflow-hidden flex flex-col hover:shadow-md transition-all">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={getImageUrl(item.name, item.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {item.popular && (
                        <span className="absolute top-2 left-2 rounded-full bg-gold-400 text-navy-900 text-[9px] font-bold px-2 py-0.5 uppercase">Popular</span>
                      )}
                      {cartQty > 0 && isCustomerLoggedIn && (
                        <span className="absolute top-2 right-2 grid place-items-center min-w-[22px] h-[22px] rounded-full bg-maroon-700 text-cream-50 text-xs font-bold">{cartQty}</span>
                      )}
                      <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full glass px-2 py-0.5 text-[10px] font-medium">
                        <Clock className="w-2.5 h-2.5" /> {item.prepTime}m
                      </div>
                    </div>
                    <div className="p-3 sm:p-3.5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-sans font-bold text-xs sm:text-sm text-navy-900 dark:text-cream-50 leading-tight">{item.name}</h3>
                        <span className="font-sans font-bold text-xs sm:text-sm text-maroon-700 dark:text-gold-300 whitespace-nowrap">₹{item.price}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-navy-600 dark:text-cream-200/70 leading-relaxed mb-2 sm:mb-3 flex-1 line-clamp-2">{item.description}</p>
                      
                      {isCustomerLoggedIn ? (
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
                          <button
                            onClick={() => handleQuickAdd(item)}
                            className="w-full btn-primary text-xs py-2 font-semibold flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                          <button
                            onClick={() => setSheetItem(item)}
                            className="w-full text-[10px] sm:text-xs py-1.5 rounded-full border border-maroon-700/20 text-maroon-800 dark:text-gold-300 hover:bg-maroon-50 dark:hover:bg-navy-800 transition-colors font-semibold text-center"
                          >
                            Customize
                          </button>
                        </div>
                      ) : isOwner ? (
                        <div className="text-xs text-navy-400 dark:text-cream-200/40 text-center py-2 bg-cream-100 dark:bg-navy-800 rounded-full font-medium">
                          Owner View
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSignInModal(true)}
                          className="w-full btn-outline text-xs py-2 rounded-full font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5 text-gold-600" />
                          Login to Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {sheetItem && isCustomerLoggedIn && (
        <CustomizeSheet item={sheetItem} onClose={() => setSheetItem(null)} onAdd={(item, cust, qty) => { addLine(item, cust, qty); setSheetItem(null); }} />
      )}

      <SignInPromptModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </div>
  );
}
