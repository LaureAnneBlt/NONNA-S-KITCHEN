import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { frenchError } from "../lib/errors";
import { useAuth } from "../features/auth/AuthProvider";
import { getDisplayName, setDisplayName } from "../features/auth/profile";
import { Icon } from "./Icons";

export default function AccountMenu() {
  const { session } = useAuth();
  const email = session?.user.email ?? "";
  const userId = session?.user.id ?? "";
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) getDisplayName(userId).then(setName, () => {});
  }, [userId]);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    if (draft === null) return;
    setError("");
    try {
      await setDisplayName(userId, draft);
      setName(draft.trim());
      setDraft(null);
    } catch (err) {
      setError(frenchError(err));
    }
  }

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        aria-label="Mon compte"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          setDraft(null);
        }}
        className="grid size-9 place-items-center rounded-full border border-brass/70 bg-white/10 font-display text-[0.95rem] font-semibold text-on-primary transition active:scale-95"
      >
        {(name || email)[0]?.toUpperCase() ?? "·"}
      </button>
      {open && (
        <div
          role="menu"
          className="card absolute right-0 top-11 z-30 w-64 animate-pop p-1.5 text-fg shadow-raised"
        >
          {draft === null ? (
            <div className="flex items-center gap-2 px-3 pb-2 pt-2.5">
              <p className="min-w-0 flex-1">
                <span className="block truncate font-display text-[1.0625rem] font-semibold italic">
                  {name || "Mon compte"}
                </span>
                <span className="block truncate text-xs text-muted">
                  {email}
                </span>
              </p>
              <button
                role="menuitem"
                aria-label="Modifier mon prénom"
                className="icon-btn size-9"
                onClick={() => setDraft(name)}
              >
                <Icon name="edit" size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={saveName} className="flex flex-col gap-2 p-2">
              <label htmlFor="display-name" className="field-label mb-0">
                Ton prénom
              </label>
              <input
                id="display-name"
                className="input"
                required
                maxLength={40}
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <p className="text-xs text-muted">
                C’est ce que ta famille voit sur tes recettes.
              </p>
              {error && (
                <p role="alert" className="text-xs font-semibold text-primary">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary btn-sm flex-1"
                  onClick={() => setDraft(null)}
                >
                  Annuler
                </button>
                <button className="btn btn-sm flex-1">Enregistrer</button>
              </div>
            </form>
          )}
          <div className="mx-3 border-t border-line" />
          <button
            role="menuitem"
            onClick={() => supabase.auth.signOut()}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary active:bg-line"
          >
            <Icon name="logout" size={18} />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
