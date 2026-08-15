import { ArrowRight, Coffee, Leaf, Clock, Heart, Award, MapPin, Users } from 'lucide-react';
import { useRouter } from '@/router';
import { Charminar, Lantern } from '@/components/Charminar';

export function AboutPage() {
  const { navigate } = useRouter();

  return (
    <div className="bg-grain min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-maroon-950 via-maroon-900 to-navy-950">
        <div className="absolute inset-0 bg-grain opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-400/10 blur-[120px]" />
        <Lantern className="absolute top-28 left-[10%] w-14 h-24 text-gold-400/30 animate-float" />
        <Lantern className="absolute bottom-20 right-[12%] w-12 h-20 text-gold-400/20 animate-float [animation-delay:2s]" />
        <Charminar className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[400px] h-[320px] text-cream-100/[0.05] hidden md:block" />

        <div className="relative container-px mx-auto max-w-3xl text-center">
          <p className="section-label justify-center">Our Story</p>
          <h1 className="font-sans font-extrabold text-cream-50 text-4xl lg:text-6xl mt-4 mb-6 leading-[1.05]">
            A cup that carries
            <br />
            <span className="text-gradient-gold">400 years of culture.</span>
          </h1>
          <p className="prose-body text-cream-200/80 text-lg max-w-xl mx-auto">
            Hyderabadi Flavour since 2022. From a single outlet to 400+ stores —
            our story is steeped in tradition, brewed with patience, and served with pride.
            Serving 1 Crore+ happy customers and 3 Crore+ cups and counting.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-28">
        <div className="container-px mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="section-label justify-center">The Journey</p>
            <h2 className="heading text-3xl lg:text-4xl mt-3">From stall to sensation.</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-cream-300 dark:bg-navy-700 lg:-translate-x-1/2" />

            {[
              { year: '2022', title: 'The First Outlet', desc: 'Deccan Chai opens its first outlet in Hyderabad, serving strong Hyderabadi chai.' },
              { year: '2023', title: '50+ Outlets', desc: 'Word spreads across Hyderabad and Telangana. We open our 50th outlet.' },
              { year: '2024', title: ' Outlets', desc: 'Deccan Chai expands across India with 400+ stores and 1 Crore+ happy customers.' },
              { year: '2025', title: '3 Crore+ Cups', desc: 'Today, Deccan Chai has served 3 Crore+ cups — and we are just getting started.' },
            ].map((item, i) => (
              <div key={item.year} className={`relative flex gap-6 lg:gap-0 mb-10 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                <div className="lg:w-1/2 lg:px-8">
                  <div className={`card p-5 ${i % 2 === 0 ? 'lg:text-right' : ''}`}>
                    <p className="font-sans font-extrabold text-2xl text-maroon-700 dark:text-gold-300 mb-1">{item.year}</p>
                    <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-1.5">{item.title}</h3>
                    <p className="text-sm text-navy-600 dark:text-cream-200/70 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {/* Dot */}
                <div className="absolute left-4 lg:left-1/2 top-4 -translate-x-1/2 grid place-items-center w-4 h-4 rounded-full bg-maroon-700 dark:bg-gold-400 ring-4 ring-cream-50 dark:ring-navy-950 z-10" />
                <div className="hidden lg:block lg:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-b from-cream-100/50 to-transparent dark:from-navy-900/30">
        <div className="container-px mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="section-label justify-center">What We Believe</p>
            <h2 className="heading text-3xl lg:text-4xl mt-3">Brewed on four principles.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Leaf, title: 'Authentic Sourcing', desc: 'Assam leaves hand-selected each season. No compromises, ever.' },
              { icon: Clock, title: 'Slow Simmered', desc: 'Every cup is simmered, never rushed. Patience is an ingredient.' },
              { icon: Heart, title: 'Hyderabadi Warmth', desc: 'Service that feels like home. Hospitality is our heritage.' },
              { icon: Award, title: 'Consistent Quality', desc: 'The same cup at outlet 1 and outlet 400. That\'s our promise.' },
            ].map((v) => (
              <div key={v.title} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="mx-auto mb-4 grid place-items-center w-14 h-14 rounded-2xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300">
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50 mb-2">{v.title}</h3>
                <p className="text-sm text-navy-600 dark:text-cream-200/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-28">
        <div className="container-px mx-auto max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { icon: MapPin, n: '400+', l: 'Outlets across India' },
              { icon: Users, n: '1 Cr+', l: 'Happy customers' },
              { icon: Coffee, n: '3 Cr+', l: 'Cups sold' },
              { icon: Award, n: '2022', l: 'Serving since' },
            ].map((s) => (
              <div key={s.l}>
                <div className="mx-auto mb-3 grid place-items-center w-12 h-12 rounded-full bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300">
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="font-sans font-extrabold text-3xl lg:text-4xl text-maroon-800 dark:text-gold-300">{s.n}</p>
                <p className="text-xs text-navy-500 dark:text-cream-200/60 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-px mx-auto max-w-3xl text-center">
          <h2 className="heading text-3xl lg:text-4xl mb-4">Come, share a cup with us.</h2>
          <p className="prose-body mb-8">Whether it's your first Deccan Chai or your thousandth — there's always a table waiting.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate('order')} className="btn-primary group">
              Order on Table
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => navigate('outlets')} className="btn-outline">
              <MapPin className="w-4 h-4" />
              Find an Outlet
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
