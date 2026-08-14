export const getImageUrl = (name: string, originalUrl?: string) => {
  if (originalUrl && (originalUrl.startsWith('data:image/') || originalUrl.startsWith('http://') || originalUrl.startsWith('https://') || originalUrl.startsWith('/'))) {
    return originalUrl;
  }
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (slug.endsWith('-')) slug = slug.slice(0, -1);
  return `/images/menu/${slug}.jpg`;
};
