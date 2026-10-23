import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { Icon } from "../../components/Icons";

type Props = { value: string[]; onChange: (steps: string[]) => void };

export default function StepsEditor({ value, onChange }: Props) {
  const fields = useRef<(HTMLTextAreaElement | null)[]>([]);
  const focusAt = useRef<{ index: number; end: boolean } | null>(null);

  useLayoutEffect(() => {
    fields.current.forEach((el) => {
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  });
  useEffect(() => {
    const target = focusAt.current;
    if (!target) return;
    focusAt.current = null;
    const el = fields.current[target.index];
    el?.focus();
    const pos = target.end ? (el?.value.length ?? 0) : 0;
    el?.setSelectionRange(pos, pos);
  }, [value]);

  const replace = (i: number, parts: string[]) =>
    onChange([...value.slice(0, i), ...parts, ...value.slice(i + 1)]);

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>, i: number) {
    const el = e.currentTarget;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      focusAt.current = { index: i + 1, end: false };
      replace(i, [
        el.value.slice(0, el.selectionStart),
        el.value.slice(el.selectionEnd),
      ]);
    } else if (e.key === "Backspace" && el.value === "" && value.length > 1) {
      e.preventDefault();
      focusAt.current = { index: Math.max(0, i - 1), end: true };
      replace(i, []);
    }
  }

  function onChangeAt(i: number, text: string) {
    if (!text.includes("\n")) return replace(i, [text]);
    const parts = text
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    focusAt.current = { index: i + Math.max(0, parts.length - 1), end: true };
    replace(i, parts.length ? parts : [""]);
  }

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2.5">
        {value.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="num w-5 shrink-0 pt-3 text-right text-[1.125rem]">
              {i + 1}
            </span>
            <textarea
              ref={(el) => {
                fields.current[i] = el;
              }}
              rows={1}
              className="input min-w-0 flex-1"
              aria-label={`Étape ${i + 1}`}
              placeholder={
                i === 0 ? "Décris la première étape…" : "Étape suivante…"
              }
              enterKeyHint="next"
              value={step}
              onChange={(e) => onChangeAt(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
            />
            {value.length > 1 && (
              <button
                type="button"
                aria-label={`Retirer l’étape ${i + 1}`}
                className="icon-btn mt-0.5 size-9"
                onClick={() => {
                  focusAt.current = null;
                  replace(i, []);
                }}
              >
                <Icon name="x" size={18} />
              </button>
            )}
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="btn-secondary btn-sm border-dashed"
        onClick={() => {
          focusAt.current = { index: value.length, end: true };
          onChange([...value, ""]);
        }}
      >
        <Icon name="plus" size={16} />
        Ajouter une étape
      </button>
    </div>
  );
}
