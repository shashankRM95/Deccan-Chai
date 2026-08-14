import type { MenuCategory, CustomizationProfile } from './types';

export const categoryMeta: Record<MenuCategory, { icon: string; tagline: string }> = {
  'Milk Tea': { icon: '☕', tagline: 'The soul of Deccan Chai · ₹15-20' },
  Coffee: { icon: '🫘', tagline: 'Bold South Indian roasts · ₹20-25' },
  'Immune Teas': { icon: '🍵', tagline: 'Immunity in every sip · ₹20-25' },
  'Bellam Flavours': { icon: '🍯', tagline: 'Palm jaggery specials · ₹20-25' },
  Lassies: { icon: '🥛', tagline: 'Yoghurt refreshers · ₹40-60' },
  'Milk Shakes': { icon: '🥛', tagline: 'Creamy fruit indulgence · ₹60-80' },
  Chillers: { icon: '🧊', tagline: 'Cool down, Deccan style · ₹50-80' },
  Mojitos: { icon: '🍃', tagline: 'Fresh fruit refreshers · ₹50-70' },
  Snacks: { icon: '🥟', tagline: 'Hyderabadi street classics · ₹10-30' },
};

export const categoryOrder: MenuCategory[] = [
  'Milk Tea',
  'Coffee',
  'Immune Teas',
  'Bellam Flavours',
  'Lassies',
  'Milk Shakes',
  'Chillers',
  'Mojitos',
  'Snacks',
];

export function getCustomizationProfile(category: MenuCategory): CustomizationProfile {
  switch (category) {
    case 'Milk Tea':
    case 'Coffee':
    case 'Immune Teas':
    case 'Bellam Flavours':
      return 'hot_beverage';
    case 'Chillers':
      return 'cold_beverage';
    case 'Milk Shakes':
      return 'shakes';
    case 'Mojitos':
      return 'mojitos';
    case 'Lassies':
      return 'lassis';
    case 'Snacks':
      return 'snacks';
    default:
      return 'hot_beverage';
  }
}
