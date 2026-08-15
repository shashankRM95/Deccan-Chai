import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Clock, Flame, Star, Loader2, Heart, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MenuCategory, MenuItem } from '@/data/types';
import { categoryOrder, categoryMeta } from '@/data/menu';
import { useCart, defaultCustomization } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/router';
import { CustomizeSheet } from '@/components/CustomizeSheet';
import { SignInPromptModal } from '@/components/SignInPromptModal';
import { getImageUrl } from '@/getImageUrl';

export function MenuPage() {
  const [activeCat, setActiveCat] = useState<MenuCategory | 'All' | 'Favorites'>('All');
  const [query, setQuery] = useState('');
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('deccan_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [barVisible, setBarVisible] = useState(true);

  const { addLine, itemCount, subtotal } = useCart();
  const { user, profile } = useAuth();
  const { navigate } = useRouter();

  const isOwner = profile?.role === 'owner';

  // Real-time synchronization for menu items from Supabase
  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('sort_order');
      if (error) {
        setErrorMsg(error.message || JSON.stringify(error));
      } else if (data) {
        setItems(
          data.map((d: any) => ({
            id: d.id,
            name: d.name,
            category: d.category as MenuCategory,
            price: parseFloat(d.price),
            description: d.description,
            prepTime: d.prep_time,
            image: d.image,
            popular: d.popular,
            available: d.available,
          }))
        );
      }
      setLoading(false);
    };

    fetchMenu();

    const channel = supabase
      .channel('public:menu_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          fetchMenu();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync favorites with Supabase if logged in
  useEffect(() => {
    if (!user) return;
    const fetchFavs = async () => {
      const { data } = await supabase.from('favorites').select('menu_item_id').eq('user_id', user.id);
      if (data) {
        const ids = data.map((f: any) => f.menu_item_id);
        setFavorites(ids);
        localStorage.setItem('deccan_favorites', JSON.stringify(ids));
      }
    };
    fetchFavs();
  }, [user]);

  const toggleFavorite = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = favorites.includes(itemId);
    const newFavs = isFav ? favorites.filter((id) => id !== itemId) : [...favorites, itemId];
    setFavorites(newFavs);
    localStorage.setItem('deccan_favorites', JSON.stringify(newFavs));

    if (user) {
      if (isFav) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('menu_item_id', itemId);
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, menu_item_id: itemId });
      }
    }
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY && currentY > 120) {
        setBarVisible(false);
      } else if (currentY < lastY) {
        setBarVisible(true);
      }
      lastY = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((m) => {
      const matchCat =
        activeCat === 'All'
          ? true
          : activeCat === 'Favorites'
          ? favorites.includes(m.id)
          : m.category === activeCat;
      const matchQuery =
        !query ||
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [items, activeCat, query, favorites]);

  const grouped = useMemo(() => {
    if (activeCat === 'Favorites') {
      return { Favorites: filtered };
    }
    if (activeCat !== 'All') return { [activeCat]: filtered };
    return categoryOrder.reduce((acc, cat) => {
      const catItems = filtered.filter((m) => m.category === cat);
      if (catItems.length) acc[cat] = catItems;
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [filtered, activeCat]);

  const handleQuickAdd = (item: MenuItem) => {
    addLine(item, { ...defaultCustomization, temperature: isColdCategory(item.category) ? 'Cold' : 'Hot' }, 1);
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-20 text-red-500 font-bold bg-white p-4 rounded-lg">
        Error fetching menu: {errorMsg}
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24 bg-grain min-h-screen pb-24">
      {/* Header */}
      <section className="relative py-12 lg:py-16 bg-gradient-to-br from-maroon-900 to-navy-950 overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-20" />
        <div className="absolute -top-20 right-1/4 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative container-px mx-auto max-w-7xl">
          <p className="section-label">Digital Menu</p>
          <h1 className="font-sans font-extrabold text-cream-50 text-4xl lg:text-5xl mt-3 mb-4">
            Every cup, a story.
          </h1>
          <p className="prose-body text-cream-200/80 max-w-xl">
            Explore our full range — from the signature Deccan Chai to thick shakes and Hyderabadi snacks.
            Tap any item to customize and add to your order.
          </p>
        </div>
      </section>

      {/* Sticky search + categories */}
      <div
        className={`sticky top-16 lg:top-20 z-30 glass border-y border-cream-300/40 dark:border-cream-100/10 transition-transform duration-300 ${
          barVisible ? 'translate-y-0' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="container-px mx-auto max-w-7xl py-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 dark:text-cream-200/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chai, coffee, snacks..."
              className="w-full rounded-full pl-11 pr-4 py-2.5 text-sm bg-white dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <CatChip label="All" active={activeCat === 'All'} onClick={() => setActiveCat('All')} />
            <CatChip
              label={`❤️ Favorites (${favorites.length})`}
              active={activeCat === 'Favorites'}
              onClick={() => setActiveCat('Favorites')}
            />
            {categoryOrder.map((cat) => (
              <CatChip
                key={cat}
                label={`${categoryMeta[cat].icon} ${cat}`}
                active={activeCat === cat}
                onClick={() => setActiveCat(cat)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Menu grid */}
      <section className="container-px mx-auto max-w-7xl py-10 lg:py-14">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-navy-900/50 rounded-3xl p-8 border border-cream-200 dark:border-navy-800">
            <Heart className="w-12 h-12 text-navy-300 dark:text-cream-200/30 mx-auto mb-3" />
            <p className="prose-body text-lg font-semibold">
              {activeCat === 'Favorites'
                ? 'No favorite items yet.'
                : 'No items match your search.'}
            </p>
            {activeCat === 'Favorites' && (
              <p className="text-xs text-navy-500 dark:text-cream-200/60 mt-1">
                Click the ❤️ heart icon on any menu item to add it to your favorites list!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-14">
            {Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="heading text-2xl lg:text-3xl">{cat}</h2>
                    {categoryMeta[cat as MenuCategory] && (
                      <p className="text-sm text-navy-500 dark:text-cream-200/60 mt-0.5">
                        {categoryMeta[cat as MenuCategory].tagline}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-navy-400 dark:text-cream-200/50">
                    {catItems.length} items
                  </span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {catItems.map((item) => {
                    const isFav = favorites.includes(item.id);
                    return (
                      <article
                        key={item.id}
                        className="card group overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all relative"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={getImageUrl(item.name, item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent" />
                          
                          {/* Favorite Heart Toggle Button */}
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            aria-label="Toggle Favorite"
                            className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full glass hover:scale-110 transition-transform text-white shadow-md z-10"
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${
                                isFav ? 'fill-red-500 text-red-500' : 'text-cream-50 hover:text-red-400'
                              }`}
                            />
                          </button>

                          {item.popular && (
                            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-gold-400 text-navy-900 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
                              <Star className="w-2.5 h-2.5 fill-current" /> Popular
                            </span>
                          )}
                          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[11px] font-medium text-navy-700 dark:text-cream-100">
                            <Clock className="w-3 h-3" /> {item.prepTime}m
                          </div>
                        </div>
                        <div className="p-3 sm:p-5 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1.5">
                            <h3 className="font-sans font-bold text-xs sm:text-sm text-navy-900 dark:text-cream-50 leading-tight">
                              {item.name}
                            </h3>
                            <span className="font-sans font-bold text-xs sm:text-sm text-maroon-700 dark:text-gold-300 whitespace-nowrap">
                              ₹{item.price}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-sm text-navy-600 dark:text-cream-200/70 leading-relaxed mb-3 flex-1 line-clamp-2">
                            {item.description}
                          </p>

                          {isOwner ? (
                            <div className="text-xs text-navy-400 dark:text-cream-200/40 text-center py-2 bg-cream-100 dark:bg-navy-800 rounded-full font-medium">
                              Store Owner View
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <button
                                onClick={() => setSheetItem(item)}
                                className="flex-1 btn-outline text-[10px] sm:text-xs py-2 sm:py-2.5"
                              >
                                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" />
                                Customize
                              </button>
                              <button
                                onClick={() => handleQuickAdd(item)}
                                className="btn-primary text-[10px] sm:text-xs py-2 sm:py-2.5 px-2.5 sm:px-4"
                              >
                                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Sticky Cart Bar for fast checkout */}
      {!isOwner && itemCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-fade-up">
          <div className="bg-navy-950/90 text-cream-50 backdrop-blur-md border border-gold-400/40 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative grid place-items-center w-10 h-10 rounded-full bg-maroon-700 text-gold-300 font-bold">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-400 text-navy-950 text-xs flex items-center justify-center font-extrabold">
                  {itemCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-cream-200/70 font-medium">Order Subtotal</p>
                <p className="font-sans font-bold text-lg text-gold-300">₹{subtotal}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('order')}
              className="btn-primary text-xs py-2.5 px-5 font-bold shadow-lg flex items-center gap-1.5"
            >
              View Cart & Checkout →
            </button>
          </div>
        </div>
      )}

      {sheetItem && (
        <CustomizeSheet
          item={sheetItem}
          onClose={() => setSheetItem(null)}
          onAdd={(item, customization, qty) => {
            addLine(item, customization, qty);
            setSheetItem(null);
          }}
        />
      )}

      <SignInPromptModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </div>
  );
}

function isColdCategory(cat: string): boolean {
  return (
    cat === 'Chillers' ||
    cat === 'Mojitos' ||
    cat === 'Milk Shakes' ||
    cat === 'Thick Shakes' ||
    cat === 'Lassies'
  );
}

function CatChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'bg-maroon-700 text-cream-50 shadow-md shadow-maroon-900/20'
          : 'bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-navy-700'
      }`}
    >
      {label}
    </button>
  );
}
