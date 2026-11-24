import { useEffect, useState } from "react";
import { Button, Card, Icon, IconButton, Tomato } from "../ui";

type InstallEvent = Event & { prompt: () => Promise<void> };

/** Android/Chrome : bouton d'installation natif. iOS : explication (Safari n'a pas d'API). */
export default function InstallPrompt() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone || hidden || (!evt && !ios)) return null;

  return (
    <Card className="mb-6 flex items-center gap-3 py-2.5 pl-3.5 pr-1.5">
      <Tomato size={28} className="shrink-0" />
      <p className="flex-1 text-sm leading-snug">
        {evt ? (
          "Installe l’app sur ton écran d’accueil."
        ) : (
          <>
            Pour installer : <b className="font-semibold">Partager</b> puis «
            Sur l’écran d’accueil ».
          </>
        )}
      </p>
      {evt && (
        <Button
          size="xs"
          onClick={() => evt.prompt().then(() => setHidden(true))}
        >
          Installer
        </Button>
      )}
      <IconButton label="Fermer" size="sm" onClick={() => setHidden(true)}>
        <Icon name="x" size={18} />
      </IconButton>
    </Card>
  );
}
