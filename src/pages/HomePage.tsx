import { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Coffee, Star, Quote, ChevronLeft, ChevronRight, Clock, Award, Leaf, Heart } from 'lucide-react';
import { useRouter } from '@/router';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/getImageUrl';
import type { MenuItem } from '@/data/types';
import { testimonials } from '@/data/testimonials';
import { Charminar, Lantern } from '@/components/Charminar';

export function HomePage() {
  const { navigate } = useRouter();
  const [tIdx, setTIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [featured, setFeatured] = useState<MenuItem[]>([]);

  useEffect(() => {
    setMounted(true);
    if (testimonials.length > 0) {
      const t = setInterval(() => setTIdx((i) => (i + 1) % testimonials.length), 6000);
      return () => clearInterval(t);
    }
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase.from('menu_items').select('*').eq('popular', true).eq('available', true).limit(4);
      if (data) {
        setFeatured(data.map((d: any) => ({
          id: d.id, name: d.name, category: d.category, price: parseFloat(d.price),
          description: d.description, prepTime: d.prep_time, image: d.image, popular: d.popular,
        })));
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-grain">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-maroon-950 via-maroon-900 to-navy-950">
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gold-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-maroon-500/20 blur-[100px]" />
        </div>

        {/* Floating lanterns */}
        <Lantern className="absolute top-24 left-[8%] w-12 h-20 text-gold-400/40 animate-float" />
        <Lantern className="absolute top-40 right-[10%] w-16 h-28 text-gold-400/30 animate-float [animation-delay:1.5s]" />
        <Lantern className="absolute bottom-32 left-[15%] w-10 h-16 text-gold-400/20 animate-float [animation-delay:3s]" />

        {/* Charminar silhouette */}
        <Charminar className="absolute bottom-0 right-0 w-[500px] h-[400px] text-cream-100/[0.06] pointer-events-none hidden md:block" />

        <div className="relative container-px mx-auto max-w-7xl pt-24 pb-16 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className={`inline-flex items-center gap-2 rounded-full bg-gold-400/10 border border-gold-400/20 px-4 py-1.5 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              <span className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
                ))}
              </span>
              <span className="text-xs font-medium text-gold-300">Loved by 1 Crore+ chai lovers across India</span>
            </div>

            <h1 className={`font-sans font-extrabold text-cream-50 text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
              Hyderabadi Flavour,
              <br />
              <span className="text-gradient-gold">brewed into</span> every cup.
            </h1>

            <p className={`prose-body text-cream-200/80 text-lg max-w-xl ${mounted ? 'animate-fade-up [animation-delay:0.15s]' : 'opacity-0'}`}>
              From a single outlet to 250+ stores nationwide — Deccan Chai carries the
              warmth of Hyderabadi tradition. Strong, fragrant, soulful. Brewed fresh, every cup.
            </p>

            <div className={`flex flex-wrap items-center gap-3 ${mounted ? 'animate-fade-up [animation-delay:0.3s]' : 'opacity-0'}`}>
              <button onClick={() => navigate('order')} className="btn-gold group">
                Order on Table
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button onClick={() => navigate('menu')} className="btn-ghost">
                Browse Full Menu
              </button>
              <button onClick={() => navigate('outlets')} className="btn-ghost">
                <MapPin className="w-4 h-4" />
                Find an Outlet
              </button>
            </div>

            <div className={`flex items-center gap-8 pt-4 ${mounted ? 'animate-fade-up [animation-delay:0.45s]' : 'opacity-0'}`}>
              {[
                { n: '250+', l: 'Outlets' },
                { n: '1 Cr+', l: 'Customers' },
                { n: '3 Cr+', l: 'Cups Sold' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-sans font-extrabold text-3xl text-gold-300">{s.n}</p>
                  <p className="text-xs uppercase tracking-[0.15em] text-cream-200/60">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero cup visual */}
          <div className="lg:col-span-5 relative hidden lg:flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-400/20 to-maroon-500/10 blur-2xl" />
              <div className="relative w-full h-full rounded-full overflow-hidden ring-1 ring-cream-100/10 shadow-2xl shadow-maroon-950/50">
                <img
                  src="/images/hero/Deccan_Chai_Logo_1.png"
                  alt="Deccan Chai"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/60 via-transparent to-transparent" />
              </div>
              {/* Steam */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3">
                {[0, 0.8, 1.6].map((d, i) => (
                  <span
                    key={i}
                    className="block w-1.5 h-10 rounded-full bg-cream-100/40 animate-steam"
                    style={{ animationDelay: `${d}s` }}
                  />
                ))}
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-6 glass rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-xs text-navy-600 dark:text-cream-200/70 font-medium">Signature Brew</p>
                <p className="font-sans font-bold text-maroon-800 dark:text-gold-300">Deccan Chai · ₹20</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream-200/40">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <span className="w-px h-8 bg-cream-200/30 animate-pulse" />
        </div>
      </section>

      {/* HERITAGE STRIP */}
      <section className="py-20 lg:py-28">
        <div className="container-px mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative h-64 lg:h-80 rounded-3xl overflow-hidden glass hover:shadow-xl transition-all duration-500">
                    <img src="/images/menu/kadak-tea.jpg" alt="Brewing chai" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="relative h-48 lg:h-64 rounded-3xl overflow-hidden glass hover:shadow-xl transition-all duration-500">
                    <img src="/images/menu/spices.jpg" alt="Spices" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
                <div className="space-y-4 lg:space-y-6 pt-8 lg:pt-12">
                  <div className="relative h-48 lg:h-64 rounded-3xl overflow-hidden glass hover:shadow-xl transition-all duration-500">
                    <img src="/images/menu/filter-coffee.jpg" alt="Filter coffee" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="relative h-64 lg:h-80 rounded-3xl overflow-hidden glass hover:shadow-xl transition-all duration-500">
                    <img src="/images/menu/osmania-biscuit.jpg" alt="Osmania biscuits" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 glass rounded-2xl px-6 py-4 shadow-xl hidden sm:block">
                <p className="font-sans font-extrabold text-2xl text-maroon-800 dark:text-gold-300">Est. 2022</p>
                <p className="text-xs text-navy-600 dark:text-cream-200/70">growing every day</p>
              </div>
            </div>

            <div>
              <p className="section-label">Our Heritage</p>
              <h2 className="heading text-4xl lg:text-5xl mt-3 mb-6">
                Born in the city of Char Minar.
              </h2>
              <p className="prose-body text-lg mb-5">
                Since August 2022, Deccan Chai has been brewing the way Hyderabadis
                love it — strong, milky, and fragrant with cardamom. Word spread. Lines grew.
                Soon, that single outlet became ten, then a hundred, then 250+.
              </p>
              <p className="prose-body text-lg mb-8">
                Today, Deccan Chai serves 1 Crore+ happy customers across 250+ stores. We still
                simmer our tea slow. And every cup still carries the warmth of Hyderabadi hospitality —
                whether you're in Jubilee Hills or beyond.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Leaf, label: 'Hand-sourced Assam leaves' },
                  { icon: Clock, label: 'Slow-simmered, never rushed' },
                  { icon: Heart, label: 'Hyderabadi hospitality' },
                ].map((f) => (
                  <div key={f.label} className="text-center">
                    <div className="mx-auto mb-2 grid place-items-center w-11 h-11 rounded-full bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-navy-600 dark:text-cream-200/70 leading-tight">{f.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('about')} className="btn-outline mt-8 group">
                Read our full story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DRINKS */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-cream-100/50 to-transparent dark:from-navy-900/30">
        <div className="container-px mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="section-label">Specialty Drinks</p>
              <h2 className="heading text-4xl lg:text-5xl mt-3">Crowd favourites.</h2>
            </div>
            <button onClick={() => navigate('menu')} className="btn-outline group self-start sm:self-auto">
              View full menu
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((item: MenuItem, i: number) => (
              <div
                key={item.id}
                className="card group overflow-hidden hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => navigate('menu')}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={getImageUrl(item.name, item.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-gold-400 text-navy-900 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
                      Popular
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50">{item.name}</h3>
                    <span className="font-sans font-bold text-maroon-700 dark:text-gold-300 whitespace-nowrap">₹{item.price}</span>
                  </div>
                  <p className="text-sm text-navy-600 dark:text-cream-200/70 leading-relaxed line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-28">
        <div className="container-px mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="section-label justify-center">Kind Words</p>
            <h2 className="heading text-4xl lg:text-5xl mt-3">What Hyderabad says.</h2>
          </div>

          {testimonials.length > 0 ? (
            <div className="relative max-w-3xl mx-auto">
              <div className="card p-8 lg:p-12 text-center">
                <Quote className="w-10 h-10 text-gold-400 mx-auto mb-6" />
                <p className="prose-body text-xl lg:text-2xl text-navy-800 dark:text-cream-100 mb-6 italic">
                  "{testimonials[tIdx].quote}"
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(testimonials[tIdx].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div className="grid place-items-center w-11 h-11 rounded-full bg-maroon-700 text-cream-50 font-sans font-bold text-sm">
                    {testimonials[tIdx].initials}
                  </div>
                  <div className="text-left">
                    <p className="font-sans font-bold text-navy-900 dark:text-cream-50">{testimonials[tIdx].name}</p>
                    <p className="text-xs text-navy-600 dark:text-cream-200/60">{testimonials[tIdx].location}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setTIdx((i) => (i - 1 + testimonials.length) % testimonials.length)} aria-label="Previous" className="grid place-items-center w-9 h-9 rounded-full border border-navy-900/10 dark:border-cream-100/10 hover:bg-maroon-50 dark:hover:bg-navy-800 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTIdx(i)}
                      aria-label={`Go to testimonial ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === tIdx ? 'w-6 bg-maroon-700 dark:bg-gold-400' : 'w-1.5 bg-navy-900/20 dark:bg-cream-100/20'}`}
                    />
                  ))}
                </div>
                <button onClick={() => setTIdx((i) => (i + 1) % testimonials.length)} aria-label="Next" className="grid place-items-center w-9 h-9 rounded-full border border-navy-900/10 dark:border-cream-100/10 hover:bg-maroon-50 dark:hover:bg-navy-800 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="card p-10 text-center">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-navy-200 dark:text-cream-200/20" />
                  ))}
                </div>
                <h3 className="font-sans font-bold text-lg text-navy-900 dark:text-cream-50 mb-2">Be the first to review!</h3>
                <p className="prose-body text-sm">Real reviews from our customers will appear here after they complete an order and share their experience.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="py-16">
        <div className="container-px mx-auto max-w-7xl">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-maroon-800 to-maroon-950 p-10 lg:p-16 text-center">
            <div className="absolute inset-0 bg-grain opacity-30" />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold-400/10 blur-3xl" />
            <Charminar className="absolute -bottom-8 left-8 w-32 h-24 text-cream-100/[0.05] hidden md:block" />
            <div className="relative">
              <Award className="w-10 h-10 text-gold-300 mx-auto mb-4" />
              <h2 className="font-sans font-extrabold text-cream-50 text-3xl lg:text-4xl mb-3">
                Scan. Sip. Savour.
              </h2>
              <p className="prose-body text-cream-200/80 max-w-lg mx-auto mb-8">
                Sit at any Deccan Chai outlet, scan the QR on your table, and order in seconds.
                No queues. No waiting at the counter. Just chai, the way you like it.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => navigate('order')} className="btn-gold">
                  <Coffee className="w-4 h-4" />
                  Start Table Order
                </button>
                <button onClick={() => navigate('menu')} className="btn-ghost">
                  Browse Full Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section className="py-16">
        <div className="container-px mx-auto max-w-3xl text-center">
          <p className="section-label justify-center">Stay in the loop</p>
          <h2 className="heading text-3xl lg:text-4xl mt-3 mb-3">Subscribe for Updates</h2>
          <p className="prose-body mb-6">Seasonal specials, new outlet openings, and chai stories — delivered monthly.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 rounded-full px-5 py-3 text-sm bg-white dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50"
            />
            <button type="submit" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
