import { useEffect, useRef } from "react";
import { Icon } from "../../components/Icons";
import { UNITS, formatIngredient, type Ingredient } from "./format";

export const emptyIngredient = (): Ingredient => ({
  name: "",
  quantity: "",
  unit: "",
  optional: false,
});

type Props = { value: Ingredient[]; onChange: (items: Ingredient[]) => void };

export default function IngredientsEditor({ value, onChange }: Props) {
  const list = useRef<HTMLUListElement>(null);
  const grew = useRef(false);

  useEffect(() => {
    if (!grew.current) return;
    grew.current = false;
    const names =
      list.current?.querySelectorAll<HTMLInputElement>("input[data-name]");
    names?.[names.length - 1]?.focus();
  }, [value.length]);

  const update = (i: number, patch: Partial<Ingredient>) =>
    onChange(
      value.map((item, idx) => (idx === i ? { ...item, ...patch } : item)),
    );
  const add = () => {
    grew.current = true;
    onChange([...value, emptyIngredient()]);
  };

  return (
    <div className="flex flex-col gap-3">
      <ul ref={list} className="flex flex-col gap-3">
        {value.map((item, i) => (
          <li
            key={i}
            className="group flex flex-col gap-2 border-b border-dashed border-line-strong pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-2">
              <input
                data-name
                className="input"
                aria-label="Ingrédient"
                placeholder="Ingrédient (ex : jambon)"
                enterKeyHint="next"
                value={item.name}
                onChange={(e) => update(i, { name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    add();
                  }
                }}
              />
              {value.length > 1 && (
                <button
                  type="button"
                  aria-label="Retirer l’ingrédient"
                  className="icon-btn size-9"
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                >
                  <Icon name="x" size={18} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                className="input w-18 shrink-0 text-center"
                aria-label="Quantité"
                placeholder="Qté"
                value={item.quantity}
                onChange={(e) => update(i, { quantity: e.target.value })}
              />
              <select
                className="input min-w-0 flex-1"
                aria-label="Unité"
                value={item.unit}
                onChange={(e) => update(i, { unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u || "— unité —"}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-pressed={!!item.optional}
                onClick={() => update(i, { optional: !item.optional })}
                className={`filter h-11 px-3 text-xs ${item.optional ? "is-on" : ""}`}
              >
                {item.optional && <Icon name="check" size={13} />}Facultatif
              </button>
            </div>
            {item.name.trim() && (
              <p className="hidden text-sm italic text-subtle group-focus-within:block">
                → {formatIngredient(item)}
                {item.optional && " (facultatif)"}
              </p>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn-secondary btn-sm border-dashed"
        onClick={add}
      >
        <Icon name="plus" size={16} />
        Ajouter un ingrédient
      </button>
    </div>
  );
}
