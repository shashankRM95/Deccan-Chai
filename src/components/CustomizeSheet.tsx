import { useState, useEffect } from 'react';
import { Minus, Plus, X, Clock } from 'lucide-react';
import { getImageUrl } from '@/getImageUrl';
import type { MenuItem, Customization, CustomizationProfile } from '@/data/types';
import { getCustomizationProfile } from '@/data/menu';
import { defaultCustomization } from '@/context/CartContext';

interface Props {
  item: MenuItem;
  onClose: () => void;
  onAdd: (item: MenuItem, customization: Customization, qty: number) => void;
}

const sugarLevels: Customization['sugarLevel'][] = ['None', 'Low', 'Medium', 'Full'];
const milkTypes: Customization['milkType'][] = ['Regular', 'Skimmed', 'Soy', 'Almond', 'Oat'];
const hotTemps: Customization['temperature'][] = ['Hot', 'Warm'];
const thicknesses: NonNullable<Customization['thickness']>[] = ['Regular', 'Thick', 'Extra Thick'];
const toppings: NonNullable<Customization['toppings']>[] = ['None', 'Whipped Cream', 'Chocolate Sauce', 'Nuts'];
const iceLevels: NonNullable<Customization['iceLevel']>[] = ['Less', 'Normal', 'Extra'];
const sweetnessLevels: Customization['sugarLevel'][] = ['None', 'Low', 'Medium', 'Full'];

export function CustomizeSheet({ item, onClose, onAdd }: Props) {
  const profile = getCustomizationProfile(item.category);
  const isCold = profile === 'cold_beverage' || profile === 'shakes' || profile === 'mojitos' || profile === 'lassis';

  const [customization, setCustomization] = useState<Customization>({
    ...defaultCustomization,
    temperature: isCold ? 'Cold' : 'Hot',
    thickness: profile === 'shakes' ? 'Thick' : undefined,
    toppings: profile === 'shakes' || profile === 'lassis' ? 'None' : undefined,
    iceLevel: profile === 'mojitos' ? 'Normal' : undefined,
    freshMint: profile === 'mojitos' ? true : undefined,
  });
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-navy-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-up">
        {/* Header image */}
        <div className="relative h-40 sm:h-48 overflow-hidden rounded-t-3xl">
          <img src={getImageUrl(item.name, item.image)} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
          <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full bg-navy-950/40 text-cream-50 hover:bg-navy-950/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="font-sans font-extrabold text-cream-50 text-xl">{item.name}</h3>
            <p className="text-sm text-cream-200/80 line-clamp-1">{item.description}</p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Prep time + price */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-sm text-navy-600 dark:text-cream-200/70">
              <Clock className="w-4 h-4 text-gold-500" />
              Est. prep time: <span className="font-semibold text-navy-900 dark:text-cream-50">{item.prepTime} min</span>
            </div>
            <span className="font-sans font-bold text-lg text-maroon-700 dark:text-gold-300">₹{item.price}</span>
          </div>

          {/* Profile-specific options */}
          {profile === 'hot_beverage' && (
            <>
              <OptionGroup label="Sugar Level">
                <ChipRow options={sugarLevels} value={customization.sugarLevel} onChange={(v) => setCustomization((c) => ({ ...c, sugarLevel: v as Customization['sugarLevel'] }))} />
              </OptionGroup>
              <OptionGroup label="Milk Preference">
                <ChipRow options={milkTypes} value={customization.milkType} onChange={(v) => setCustomization((c) => ({ ...c, milkType: v as Customization['milkType'] }))} />
              </OptionGroup>
              <OptionGroup label="Temperature">
                <ChipRow options={hotTemps} value={customization.temperature} onChange={(v) => setCustomization((c) => ({ ...c, temperature: v as Customization['temperature'] }))} />
              </OptionGroup>
            </>
          )}

          {profile === 'cold_beverage' && (
            <>
              <OptionGroup label="Sugar Level">
                <ChipRow options={sugarLevels} value={customization.sugarLevel} onChange={(v) => setCustomization((c) => ({ ...c, sugarLevel: v as Customization['sugarLevel'] }))} />
              </OptionGroup>
              <OptionGroup label="Milk Preference">
                <ChipRow options={milkTypes} value={customization.milkType} onChange={(v) => setCustomization((c) => ({ ...c, milkType: v as Customization['milkType'] }))} />
              </OptionGroup>
              <OptionGroup label="Temperature">
                <div className="flex items-center gap-2 rounded-xl bg-cream-100 dark:bg-navy-800 px-4 py-3 text-sm font-medium text-navy-600 dark:text-cream-200/70">
                  Served Chilled
                </div>
              </OptionGroup>
            </>
          )}

          {profile === 'shakes' && (
            <>
              <OptionGroup label="Thickness">
                <ChipRow options={thicknesses} value={customization.thickness || 'Thick'} onChange={(v) => setCustomization((c) => ({ ...c, thickness: v as Customization['thickness'] }))} />
              </OptionGroup>
              <OptionGroup label="Toppings">
                <ChipRow options={toppings} value={customization.toppings || 'None'} onChange={(v) => setCustomization((c) => ({ ...c, toppings: v as Customization['toppings'] }))} />
              </OptionGroup>
              <OptionGroup label="Temperature">
                <div className="flex items-center gap-2 rounded-xl bg-cream-100 dark:bg-navy-800 px-4 py-3 text-sm font-medium text-navy-600 dark:text-cream-200/70">
                  Served Chilled
                </div>
              </OptionGroup>
            </>
          )}

          {profile === 'mojitos' && (
            <>
              <OptionGroup label="Sugar Level">
                <ChipRow options={sweetnessLevels} value={customization.sugarLevel} onChange={(v) => setCustomization((c) => ({ ...c, sugarLevel: v as Customization['sugarLevel'] }))} />
              </OptionGroup>
              <OptionGroup label="Ice Level">
                <ChipRow options={iceLevels} value={customization.iceLevel || 'Normal'} onChange={(v) => setCustomization((c) => ({ ...c, iceLevel: v as Customization['iceLevel'] }))} />
              </OptionGroup>
              <OptionGroup label="Fresh Mint">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCustomization((c) => ({ ...c, freshMint: true }))}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${customization.freshMint ? 'bg-maroon-700 text-cream-50 shadow-sm' : 'bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-navy-700'}`}
                  >
                    Yes, extra mint
                  </button>
                  <button
                    onClick={() => setCustomization((c) => ({ ...c, freshMint: false }))}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!customization.freshMint ? 'bg-maroon-700 text-cream-50 shadow-sm' : 'bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-navy-700'}`}
                  >
                    No mint
                  </button>
                </div>
              </OptionGroup>
            </>
          )}

          {profile === 'lassis' && (
            <>
              <OptionGroup label="Sweetness">
                <ChipRow options={sweetnessLevels} value={customization.sugarLevel} onChange={(v) => setCustomization((c) => ({ ...c, sugarLevel: v as Customization['sugarLevel'] }))} />
              </OptionGroup>
              <OptionGroup label="Toppings">
                <ChipRow options={toppings} value={customization.toppings || 'None'} onChange={(v) => setCustomization((c) => ({ ...c, toppings: v as Customization['toppings'] }))} />
              </OptionGroup>
              <OptionGroup label="Temperature">
                <div className="flex items-center gap-2 rounded-xl bg-cream-100 dark:bg-navy-800 px-4 py-3 text-sm font-medium text-navy-600 dark:text-cream-200/70">
                  Served Chilled
                </div>
              </OptionGroup>
            </>
          )}

          {profile === 'snacks' && (
            <div className="rounded-xl bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 px-4 py-3 text-sm text-navy-600 dark:text-cream-200/70">
              No customization needed — just pick your quantity.
            </div>
          )}

          {/* Special requests */}
          <OptionGroup label="Special Requests">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. extra ginger, less water, no sugar..."
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus:outline-none focus:ring-2 focus:ring-gold-400 text-navy-900 dark:text-cream-50 resize-none"
            />
          </OptionGroup>

          {/* Quantity + Add */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" className="grid place-items-center w-9 h-9 rounded-full border border-navy-900/10 dark:border-cream-100/10 hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-sans font-bold text-lg w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase" className="grid place-items-center w-9 h-9 rounded-full border border-navy-900/10 dark:border-cream-100/10 hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => onAdd(item, { ...customization, notes: notes.trim() || undefined }, qty)}
              className="btn-primary flex-1"
            >
              Add to order · ₹{item.price * qty}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-navy-500 dark:text-cream-200/60 mb-2.5">{label}</p>
      {children}
    </div>
  );
}

function ChipRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            value === opt
              ? 'bg-maroon-700 text-cream-50 shadow-sm'
              : 'bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-navy-700'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
