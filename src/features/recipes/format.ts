export type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
  optional?: boolean;
};

export const UNITS = [
  "",
  "g",
  "kg",
  "ml",
  "cl",
  "L",
  "c. à soupe",
  "c. à café",
  "pincée",
  "gousse(s)",
  "tranche(s)",
  "feuille(s)",
  "brin(s)",
  "sachet(s)",
  "verre(s)",
  "botte(s)",
  "pièce(s)",
] as const;

const NBSP = "\u00A0";
const ASPIRATED_H =
  /^(haricot|hareng|homard|hachis|hamburger|houmous|harissa|houblon|hibou)/;

function elides(word: string) {
  const w = word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (w.startsWith("h")) return !ASPIRATED_H.test(w);
  return /^[aeiouœ]/.test(w);
}

function parseQuantity(q: string): number | null {
  const s = q.trim().replace(",", ".");
  if (!s) return null;
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function unitLabel(unit: string, quantity: string) {
  if (!unit.endsWith("(s)")) return unit;
  const stem = unit.slice(0, -3);
  const n = parseQuantity(quantity);
  return n === null
    ? quantity.trim()
      ? `${stem}s`
      : stem
    : n >= 2
      ? `${stem}s`
      : stem;
}

export function formatQuantity(i: Ingredient): string {
  const qty = i.quantity.trim();
  const unit = i.unit.trim();
  return [qty, unit && unit !== "pièce(s)" ? unitLabel(unit, qty) : ""]
    .filter(Boolean)
    .join(NBSP);
}

export function formatIngredient(i: Ingredient): string {
  const raw = i.name.trim();
  const name = raw.charAt(0).toLowerCase() + raw.slice(1);
  const qty = i.quantity.trim();
  const unit = i.unit.trim();

  if (!unit || unit === "pièce(s)")
    return [qty, name].filter(Boolean).join(" ");
  const head = [qty, unitLabel(unit, qty)].filter(Boolean).join(NBSP);
  if (!name) return head;
  return `${head} ${elides(name) ? "d’" : "de "}${name}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}${NBSP}min`;
  return m
    ? `${h}${NBSP}h${NBSP}${String(m).padStart(2, "0")}`
    : `${h}${NBSP}h`;
}
