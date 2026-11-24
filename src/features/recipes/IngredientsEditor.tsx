import { useEffect, useRef } from "react";
import { Button, Chip, Icon, IconButton, Input, Select } from "../../ui";
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
              <Input
                data-name
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
                <IconButton
                  label="Retirer l’ingrédient"
                  size="sm"
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                >
                  <Icon name="x" size={18} />
                </IconButton>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                className="w-18 shrink-0 text-center"
                aria-label="Quantité"
                placeholder="Qté"
                value={item.quantity}
                onChange={(e) => update(i, { quantity: e.target.value })}
              />
              <Select
                className="min-w-0 flex-1"
                aria-label="Unité"
                value={item.unit}
                onChange={(e) => update(i, { unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u || "— unité —"}
                  </option>
                ))}
              </Select>
              <Chip
                on={!!item.optional}
                aria-pressed={!!item.optional}
                onClick={() => update(i, { optional: !item.optional })}
                className="h-11 px-3 text-xs"
              >
                {item.optional && <Icon name="check" size={13} />}Facultatif
              </Chip>
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
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="border-dashed"
        onClick={add}
      >
        <Icon name="plus" size={16} />
        Ajouter un ingrédient
      </Button>
    </div>
  );
}
