import { useState, useEffect, useCallback } from 'react';

export type Route =
  | 'home'
  | 'menu'
  | 'order'
  | 'outlets'
  | 'about'
  | 'customer-login'
  | 'owner-login'
  | 'customer-dashboard'
  | 'owner-dashboard'
  | 'signup';

export function parseHash(): { route: Route; params: Record<string, string> } {
  let rawHash = window.location.hash.replace(/^#\/?/, '');
  if (rawHash.startsWith('access_token=') || rawHash.startsWith('error=')) {
    rawHash = 'home';
  }
  const [path, query] = rawHash.split('?');
  const params: Record<string, string> = {};
  if (query) {
    new URLSearchParams(query).forEach((v, k) => {
      params[k] = v;
    });
  }
  const validRoutes: Route[] = [
    'home', 'menu', 'order', 'outlets', 'about',
    'customer-login', 'owner-login', 'customer-dashboard', 'owner-dashboard', 'signup',
  ];
  const route = validRoutes.includes(path as Route) ? (path as Route) : 'home';
  return { route, params };
}

export function useRouter() {
  const [state, setState] = useState(parseHash());

  useEffect(() => {
    const onChange = () => setState(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((route: Route, params?: Record<string, string>) => {
    let hash = `#/${route}`;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      if (qs) hash += `?${qs}`;
    }
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { ...state, navigate };
}
