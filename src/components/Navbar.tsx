import { useState, useEffect } from 'react';
import { Menu as MenuIcon, X, Sun, Moon, MapPin, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { useRouter, type Route } from '@/router';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getAssetUrl } from '@/getImageUrl';

const navItems: { label: string; route: Route }[] = [
  { label: 'Home', route: 'home' },
  { label: 'Menu', route: 'menu' },
  { label: 'Outlets', route: 'outlets' },
  { label: 'Our Story', route: 'about' },
];

export function Navbar({ darkMode, toggleDark }: { darkMode: boolean; toggleDark: () => void }) {
  const { route, navigate } = useRouter();
  const { itemCount, tableNumber } = useCart();
  const { user, profile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      if (currentY > lastY && currentY > 80) {
        setVisible(false);
      } else if (currentY < lastY) {
        setVisible(true);
      }
      lastY = currentY;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (r: Route) => {
    navigate(r);
    setOpen(false);
  };

  const isDashboard = route === 'customer-dashboard' || route === 'owner-dashboard';
  const solid = scrolled || route !== 'home';

  return (
    <header className={`fixed top-0 inset-x-0 z-50 pt-2 pb-1 px-4 pointer-events-none transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <nav className={`container-px mx-auto max-w-5xl flex items-center justify-between h-14 lg:h-16 rounded-full transition-all duration-500 pointer-events-auto ${
        solid ? 'glass shadow-md border border-cream-300/40 dark:border-cream-100/10 px-6' : 'bg-navy-950/70 backdrop-blur-md px-6 border border-white/10'
      }`}>
        <button onClick={() => go('home')} className="flex items-center gap-2.5 group">
          <span className="grid place-items-center w-10 h-10 rounded-full bg-cream-50 shadow-lg shadow-maroon-900/30 group-hover:scale-105 transition-transform overflow-hidden">
            <img src={getAssetUrl('images/brand/brand.png')} alt="Logo" className="w-full h-full object-cover" />
          </span>
          <span className="flex flex-col leading-none">
            <span className={`font-sans font-extrabold text-lg tracking-tight ${solid ? 'text-maroon-800 dark:text-cream-50' : 'text-cream-50'}`}>
              Deccan Chai
            </span>
            <span className={`text-[10px] uppercase tracking-[0.2em] ${solid ? 'text-gold-600 dark:text-gold-400' : 'text-gold-300'}`}>
              Hyderabadi Flavour
            </span>
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => go(item.route)}
              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                route === item.route
                  ? solid
                    ? 'text-maroon-800 dark:text-gold-300'
                    : 'text-gold-300'
                  : solid
                    ? 'text-navy-700 hover:text-maroon-700 dark:text-cream-200 dark:hover:text-gold-300'
                    : 'text-cream-100/90 hover:text-gold-300'
              }`}
            >
              {item.label}
              {route === item.route && (
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold-400" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className={`grid place-items-center w-9 h-9 rounded-full transition-colors ${solid ? 'text-navy-700 hover:bg-cream-200 dark:text-cream-200 dark:hover:bg-navy-800' : 'text-cream-100 hover:bg-white/10'}`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => navigate('order', { view: 'cart' })}
            aria-label="Cart"
            className={`relative grid place-items-center w-9 h-9 rounded-full transition-colors ${solid ? 'text-navy-700 hover:bg-cream-200 dark:text-cream-200 dark:hover:bg-navy-800' : 'text-cream-100 hover:bg-white/10'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-gold-400 text-navy-900 text-[10px] font-bold">
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <button
              onClick={() => {
                const role = profile?.role || localStorage.getItem('role') || 'customer';
                go(role === 'owner' ? 'owner-dashboard' : 'customer-dashboard');
              }}
              className="hidden sm:flex items-center gap-2 rounded-full bg-maroon-50 dark:bg-navy-800 px-3 py-2 text-xs font-semibold text-maroon-800 dark:text-gold-300 hover:bg-maroon-100 dark:hover:bg-navy-700 transition-colors"
            >
              {(profile?.role === 'owner' || localStorage.getItem('role') === 'owner') ? <LayoutDashboard className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {profile?.full_name?.split(' ')[0] || 'Account'}
            </button>
          ) : (
            <button
              onClick={() => go('login')}
              className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-maroon-800 dark:text-gold-300 hover:bg-maroon-50 dark:hover:bg-navy-800 transition-colors"
            >
              <User className="w-3.5 h-3.5" /> Login
            </button>
          )}

          <button
            onClick={() => go('order')}
            className="hidden md:inline-flex btn-primary text-xs px-5 py-2.5"
          >
            Order
          </button>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className={`lg:hidden grid place-items-center w-9 h-9 rounded-full ${solid ? 'text-navy-800 dark:text-cream-50' : 'text-cream-50'}`}
          >
            {open ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {tableNumber > 0 && !isDashboard && profile?.role !== 'owner' && localStorage.getItem('role') !== 'owner' && (
        <div className="hidden lg:flex items-center justify-center gap-2 pb-2 text-xs text-maroon-700 dark:text-gold-300">
          <MapPin className="w-3 h-3" />
          Dining at Table {tableNumber}
        </div>
      )}

      {open && (
        <div className="lg:hidden glass border border-cream-300/40 dark:border-cream-100/10 rounded-3xl mt-2 p-2 shadow-2xl pointer-events-auto">
          <div className="container-px mx-auto max-w-7xl py-2 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => go(item.route)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  route === item.route
                    ? 'bg-maroon-50 text-maroon-800 dark:bg-navy-800 dark:text-gold-300 font-bold'
                    : 'text-navy-700 hover:bg-cream-100 dark:text-cream-200 dark:hover:bg-navy-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 mt-2">
              {user ? (
                <button onClick={() => {
                  const role = profile?.role || localStorage.getItem('role') || 'customer';
                  go(role === 'owner' ? 'owner-dashboard' : 'customer-dashboard');
                }} className="btn-outline flex-1">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
              ) : (
                <button onClick={() => go('login')} className="btn-outline flex-1">
                  <User className="w-4 h-4" /> Login
                </button>
              )}
              <button onClick={() => go('order')} className="btn-primary flex-1">
                Order
              </button>
            </div>
            {itemCount > 0 && (
              <button onClick={() => {
                setOpen(false);
                navigate('order', { view: 'cart' });
              }} className="btn-outline w-full mt-2">
                <ShoppingBag className="w-4 h-4" /> View Cart ({itemCount})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
