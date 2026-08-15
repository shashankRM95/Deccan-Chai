export const getAssetUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('data:image/') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const cleanPath = path.replace(/^\.?\//, '');
  return `${base}/${cleanPath}`;
};

export const getImageUrl = (name: string, originalUrl?: string) => {
  if (originalUrl) {
    return getAssetUrl(originalUrl);
  }
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (slug.endsWith('-')) slug = slug.slice(0, -1);
  return getAssetUrl(`images/menu/${slug}.jpg`);
};

