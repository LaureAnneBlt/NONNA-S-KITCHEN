import { useEffect, useState } from 'react';

type InstallEvent = Event & { prompt: () => Promise<void> };

/** Android/Chrome : bouton d'installation natif. iOS : explication (Safari n'a pas d'API). */
export default function InstallPrompt() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as InstallEvent); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (standalone || hidden || (!evt && !ios)) return null;

  return (
    <div className="card mb-4 flex items-center gap-3">
      <p className="flex-1 text-sm">
        {evt ? 'Installe Nonna Mia sur ton écran d’accueil 🍅' : 'Pour installer : touche Partager puis « Sur l’écran d’accueil » 🍅'}
      </p>
      {evt && <button className="btn px-4 py-2 text-sm" onClick={() => evt.prompt().then(() => setHidden(true))}>Installer</button>}
      <button aria-label="Fermer" className="text-muted" onClick={() => setHidden(true)}>✕</button>
    </div>
  );
}
