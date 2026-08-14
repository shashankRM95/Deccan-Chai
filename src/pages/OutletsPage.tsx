import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, Phone, Navigation, Check, X, Coffee } from 'lucide-react';
import { outlets, cities } from '@/data/outlets';
import { useRouter } from '@/router';
import type { Outlet } from '@/data/types';

function InteractiveOutletMap({
  outletsList,
  selectedOutlet,
  onSelectOutlet,
}: {
  outletsList: Outlet[];
  selectedOutlet: Outlet;
  onSelectOutlet: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeaflet = () => {
      if ((window as any).L && mapRef.current && !leafletInstance.current) {
        const L = (window as any).L;
        const map = L.map(mapRef.current, {
          center: [selectedOutlet.lat, selectedOutlet.lng],
          zoom: 12,
          zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        leafletInstance.current = map;
      }
    };

    if ((window as any).L) {
      loadLeaflet();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = loadLeaflet;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const map = leafletInstance.current;
    const L = (window as any).L;

    if (!map || !L) return;

    map.setView([selectedOutlet.lat, selectedOutlet.lng], 12, { animate: true });

    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    outletsList.forEach((o) => {
      const isSelected = o.id === selectedOutlet.id;

      const markerHtml = `
        <div class="relative flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ${
          isSelected ? 'z-50 scale-125' : 'z-10 opacity-90 hover:opacity-100'
        }">
          <div class="w-8 h-8 rounded-full ${
            isSelected
              ? 'bg-gradient-to-r from-amber-400 to-rose-700 ring-4 ring-amber-400 shadow-2xl animate-pulse'
              : 'bg-rose-900 border-2 border-white shadow-md'
          } flex items-center justify-center text-white text-xs font-bold">
            ☕
          </div>
          ${
            isSelected
              ? `<span class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full whitespace-nowrap border border-amber-400/40 shadow-lg">${o.name}</span>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-outlet-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([o.lat, o.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onSelectOutlet(o.id);
      });

      markersRef.current[o.id] = marker;
    });
  }, [outletsList, selectedOutlet, onSelectOutlet]);

  return <div ref={mapRef} className="w-full h-full min-h-[400px] lg:min-h-[600px] z-0" />;
}

export function OutletsPage() {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string>('All');
  const [dineInOnly, setDineInOnly] = useState(false);
  const [takeawayOnly, setTakeawayOnly] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return outlets.filter((o) => {
      const matchQuery =
        !query ||
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        o.area.toLowerCase().includes(query.toLowerCase()) ||
        o.address.toLowerCase().includes(query.toLowerCase());
      const matchCity = city === 'All' || o.city === city;
      const matchDineIn = !dineInOnly || o.dineIn;
      const matchTakeaway = !takeawayOnly || o.takeaway;
      return matchQuery && matchCity && matchDineIn && matchTakeaway;
    });
  }, [query, city, dineInOnly, takeawayOnly]);

  const selectedOutlet = outlets.find((o) => o.id === selected) || filtered[0] || outlets[0];

  return (
    <div className="pt-20 lg:pt-24 bg-grain min-h-screen">
      {/* Header */}
      <section className="relative py-12 lg:py-16 bg-gradient-to-br from-maroon-900 to-navy-950 overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-20" />
        <div className="absolute -top-20 left-1/4 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative container-px mx-auto max-w-7xl">
          <p className="section-label">Find Us</p>
          <h1 className="font-sans font-extrabold text-cream-50 text-4xl lg:text-5xl mt-3 mb-4">
            400+ outlets. One near you.
          </h1>
          <p className="prose-body text-cream-200/80 max-w-xl">
            From Gownipalli to Hyderabad &amp; Bengaluru, we're brewing across India. Filter by city, amenities, or
            search for your neighbourhood. Dine-in or takeaway — your chai is waiting.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="container-px mx-auto max-w-7xl py-6">
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 dark:text-cream-200/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by area, address or outlet name..."
              className="w-full rounded-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-full px-4 py-3 text-sm bg-white dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50 font-medium"
          >
            <option value="All">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <FilterChip label="Dine-in" active={dineInOnly} onClick={() => setDineInOnly(!dineInOnly)} />
            <FilterChip label="Takeaway" active={takeawayOnly} onClick={() => setTakeawayOnly(!takeawayOnly)} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Real Interactive Leaflet Multi-Marker Map View */}
          <div className="relative rounded-2xl overflow-hidden bg-navy-100 dark:bg-navy-800 min-h-[400px] lg:min-h-[600px] ring-1 ring-navy-900/5 dark:ring-cream-100/10 flex flex-col shadow-inner">
            <InteractiveOutletMap
              outletsList={filtered}
              selectedOutlet={selectedOutlet}
              onSelectOutlet={(id) => setSelected(id)}
            />

            {/* Floating Outlet Info Banner over Map */}
            {selectedOutlet && (
              <div className="absolute top-4 left-4 right-4 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-cream-200/60 dark:border-cream-100/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-maroon-700 dark:text-gold-300 shrink-0" />
                    <h4 className="font-sans font-bold text-sm text-navy-900 dark:text-cream-50 truncate">
                      {selectedOutlet.name.includes('(') ? selectedOutlet.name : `${selectedOutlet.name} (${selectedOutlet.city})`}
                    </h4>
                  </div>
                  <p className="text-xs text-navy-600 dark:text-cream-200/70 truncate mt-0.5">
                    {selectedOutlet.address}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOutlet.lat},${selectedOutlet.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs py-2 px-3 shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Get Directions
                </a>
              </div>
            )}

            <div className="absolute bottom-3 left-3 glass rounded-xl px-3 py-1.5 text-xs text-navy-700 dark:text-cream-200 font-medium shadow-md z-10">
              📍 Showing {filtered.length} Outlet Pins on Map · Selected: {selectedOutlet ? selectedOutlet.name : 'Gownipalli (Srinivaspur)'}
            </div>
          </div>

          {/* List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-10 h-10 text-navy-300 dark:text-cream-200/20 mx-auto mb-3" />
                <p className="prose-body text-sm">No outlets match your filters.</p>
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelected(o.id)}
                  className={`card w-full text-left p-4 transition-all hover:shadow-md ${selected === o.id ? 'ring-2 ring-maroon-700 dark:ring-gold-400' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-sans font-bold text-navy-900 dark:text-cream-50">{o.name}</h3>
                      <p className="text-xs text-navy-500 dark:text-cream-200/60">{o.city} · {o.area}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {o.dineIn && <span className="inline-flex items-center gap-0.5 rounded-full bg-cream-100 dark:bg-navy-800 text-[10px] font-medium px-2 py-0.5 text-navy-600 dark:text-cream-200/70"><Check className="w-2.5 h-2.5" /> Dine-in</span>}
                      {o.takeaway && <span className="inline-flex items-center gap-0.5 rounded-full bg-cream-100 dark:bg-navy-800 text-[10px] font-medium px-2 py-0.5 text-navy-600 dark:text-cream-200/70"><Check className="w-2.5 h-2.5" /> Takeaway</span>}
                    </div>
                  </div>
                  <p className="text-sm text-navy-600 dark:text-cream-200/70 mb-2 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-maroon-600 dark:text-gold-400 shrink-0" />
                    {o.address}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-navy-500 dark:text-cream-200/60">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {o.hours}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {o.phone}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap ${
        active ? 'bg-maroon-700 text-cream-50 shadow-sm' : 'bg-white dark:bg-navy-800 text-navy-700 dark:text-cream-200/70 border border-cream-300 dark:border-cream-100/10 hover:bg-cream-100 dark:hover:bg-navy-700'
      }`}
    >
      {label}
    </button>
  );
}
