import { useEffect } from 'react';

/**
 * iOS ne redimensionne pas la page quand le clavier s'ouvre : il la recouvre.
 * On mesure la zone visible (visualViewport), on l'expose dans --kb-inset
 * (utilisé en padding-bas) et on recentre le champ actif dans la zone visible.
 */
export function useKeyboardAvoidance() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;

    const update = () =>
      root.style.setProperty('--kb-inset', `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`);
    const onFocus = (e: FocusEvent) => {
      const el = e.target;
      if (el instanceof HTMLElement && el.matches('input, textarea, select')) {
        setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
      }
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    document.addEventListener('focusin', onFocus);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.removeEventListener('focusin', onFocus);
    };
  }, []);
}
