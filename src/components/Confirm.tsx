import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Options = {
  title: string;
  message?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
};

export function useConfirm() {
  const [state, setState] = useState<
    (Options & { resolve: (ok: boolean) => void }) | null
  >(null);

  const confirm = useCallback(
    (options: Options) =>
      new Promise<boolean>((resolve) => setState({ ...options, resolve })),
    [],
  );
  const close = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };

  const dialog = state && <ConfirmDialog {...state} onClose={close} />;
  return [confirm, dialog] as const;
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Annuler",
  onClose,
}: Options & { onClose: (ok: boolean) => void }) {
  const cancel = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    cancel.current?.focus();
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && closeRef.current(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-60 flex items-end justify-center bg-espresso-900/45 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:items-center"
      onPointerDown={(e) => e.target === e.currentTarget && onClose(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="card card-menu w-full max-w-sm animate-pop p-6 text-center shadow-raised"
      >
        <h2 id="confirm-title" className="section-title italic">
          {title}
        </h2>
        {message && (
          <p className="mt-2 text-[0.9375rem] text-muted">{message}</p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button type="button" className="btn" onClick={() => onClose(true)}>
            {confirmLabel}
          </button>
          <button
            type="button"
            ref={cancel}
            className="btn-secondary"
            onClick={() => onClose(false)}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
