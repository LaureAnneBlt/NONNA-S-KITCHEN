import { useState } from "react";

const TTL = 12 * 60 * 60 * 1000;
type Saved = { ingredients: number[]; steps: number[]; at: number };

export function useCookingProgress(recipeId: string) {
  const key = `cuisine:${recipeId}`;
  const [state, setState] = useState<Saved>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(key) ?? "null",
      ) as Saved | null;
      if (saved && Date.now() - saved.at < TTL) return saved;
    } catch {}
    return { ingredients: [], steps: [], at: 0 };
  });

  const save = (next: Saved) => {
    setState(next);
    try {
      if (next.ingredients.length || next.steps.length)
        localStorage.setItem(key, JSON.stringify(next));
      else localStorage.removeItem(key);
    } catch {}
  };
  const toggle = (list: "ingredients" | "steps", i: number) => {
    const cur = state[list];
    save({
      ...state,
      [list]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i],
      at: Date.now(),
    });
  };

  return {
    ingredients: new Set(state.ingredients),
    steps: new Set(state.steps),
    toggleIngredient: (i: number) => toggle("ingredients", i),
    toggleStep: (i: number) => toggle("steps", i),
    reset: () => save({ ingredients: [], steps: [], at: 0 }),
  };
}
