import { useEffect, useState } from 'react';

/**
 * Router hash-based: nessuna configurazione server, funziona identico
 * dentro una WebView Capacitor e in una PWA installata.
 */
export function normalizePath(hash: string): string {
  const raw = hash.replace(/^#/, '');
  if (!raw || raw === '/') return '/';
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return path.replace(/\/+$/, '') || '/';
}

export function usePath(): string {
  const [path, setPath] = useState(() => normalizePath(window.location.hash));

  useEffect(() => {
    const onChange = () => setPath(normalizePath(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

export function navigate(to: string): void {
  const next = to.startsWith('/') ? to : `/${to}`;
  if (normalizePath(window.location.hash) === next) return;
  window.location.hash = next;
  window.scrollTo({ top: 0, behavior: 'auto' });
}
