import { useEffect, useState } from 'react';

/** Roteamento por hash: funciona offline e no GitHub Pages. */
export function useRoute(): string[] {
  const parse = () => (window.location.hash.replace(/^#\/?/, '').split('?')[0] || '').split('/').filter(Boolean);
  const [parts, setParts] = useState(parse);
  useEffect(() => {
    const on = () => {
      setParts(parse());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return parts;
}

export const href = (to: string) => `#${to}`;
export const navigate = (to: string) => {
  window.location.hash = to;
};
