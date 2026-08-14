import { Coffee, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useRouter, type Route } from '@/router';

export function Footer() {
  const { navigate } = useRouter();

  const links: { label: string; route: Route }[] = [
    { label: 'Home', route: 'home' },
    { label: 'Full Menu', route: 'menu' },
    { label: 'Order on Table', route: 'order' },
    { label: 'Find an Outlet', route: 'outlets' },
    { label: 'Our Story', route: 'about' },
  ];

  return (
    <footer className="relative mt-20 bg-navy-950 text-cream-100 overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-40" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-maroon-700/20 blur-[120px]" />

      <div className="relative container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-maroon-700 text-gold-300">
                <Coffee className="w-5 h-5" />
              </span>
              <div>
                <p className="font-sans font-extrabold text-lg">Deccan Chai</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Hyderabadi Flavour</p>
              </div>
            </div>
            <p className="prose-body text-cream-200/70 max-w-md text-sm">
              Brewing heritage since 2022. From a single outlet to 250+ stores across India —
              serving 1 Crore+ happy customers and 3 Crore+ cups. Every cup carries the warmth of Hyderabadi tradition.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Social link"
                  className="grid place-items-center w-9 h-9 rounded-full bg-navy-800 hover:bg-maroon-700 transition-colors"
                >
                  <Icon className="w-4 h-4 text-cream-200" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 mb-4">Explore</p>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.route}>
                  <button
                    type="button"
                    onClick={() => navigate(l.route)}
                    className="text-sm text-cream-200/70 hover:text-gold-300 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 mb-4">Contact</p>
            <ul className="space-y-3 text-sm text-cream-200/70">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <span>+91 9852128128, +91 9121158128</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <span>Info@deccanchaiindia.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gold-400 shrink-0" />
                <span>293/82/C, 17/5F, Madhu Vihar, 7th Floor, Rd No. 7, Jubilee Hills, Hyderabad, Telangana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-cream-100/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-200/50">
          <p>© 2024 Deccan Chai. Hyderabadi Flavour, brewed with love since 2022.</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={(e) => e.preventDefault()} className="hover:text-gold-300 transition-colors">Privacy</button>
            <button type="button" onClick={(e) => e.preventDefault()} className="hover:text-gold-300 transition-colors">Terms</button>
            <button type="button" onClick={(e) => e.preventDefault()} className="hover:text-gold-300 transition-colors">Franchise</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
