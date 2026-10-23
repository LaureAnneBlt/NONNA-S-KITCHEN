import type { Ingredient } from './api';

const UNITS = ['', 'g', 'kg', 'ml', 'cl', 'L', 'c. à soupe', 'c. à café', 'pincée', 'pièce(s)'];
export const emptyIngredient = (): Ingredient => ({ name: '', quantity: '', unit: '' });

type Props = { value: Ingredient[]; onChange: (items: Ingredient[]) => void };

export default function IngredientsEditor({ value, onChange }: Props) {
  const update = (i: number, patch: Partial<Ingredient>) =>
    onChange(value.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-bold uppercase text-primary">Ingrédients</legend>
      {value.map((item, i) => (
        <div key={i} className="flex flex-wrap gap-2">
          <input className="input" placeholder="Ingrédient (ex : farine)" value={item.name} onChange={(e) => update(i, { name: e.target.value })} />
          <input className="input w-24" placeholder="Qté" aria-label="Quantité" value={item.quantity} onChange={(e) => update(i, { quantity: e.target.value })} />
          <select className="input min-w-0 flex-1" aria-label="Unité" value={item.unit} onChange={(e) => update(i, { unit: e.target.value })}>
            {UNITS.map((u) => <option key={u} value={u}>{u || '— unité —'}</option>)}
          </select>
          <button type="button" aria-label="Retirer l’ingrédient" className="px-2 text-muted" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="btn-ghost" onClick={() => onChange([...value, emptyIngredient()])}>+ Ajouter un ingrédient</button>
    </fieldset>
  );
}
