import { Link } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { listRecipes, deleteRecipe, photoUrl, type Ingredient } from './api';
import { listGroups } from '../groups/api';
import { useAuth } from '../auth/AuthProvider';

const formatIngredient = (i: Ingredient) => [i.quantity, i.unit, i.name].filter(Boolean).join(' ');

export default function RecipesPage() {
  const { session } = useAuth();
  const recipes = useAsync(listRecipes);
  const groups = useAsync(listGroups);
  const groupName = (id: string | null) => groups.data?.find((g) => g.id === id)?.name;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="title">Le ricette</h1>
        <Link to="/recettes/nouvelle" className="btn">+ Ajouter</Link>
      </div>
      {recipes.loading && <p>Nonna prépare tout ça…</p>}
      {recipes.error && <p className="text-primary">{recipes.error}</p>}
      {recipes.data?.length === 0 && <p className="card">Aucune recette pour l’instant. Ajoute la première ! 🍝</p>}
      {recipes.data?.map((r) => (
        <article key={r.id} className="card overflow-hidden p-0">
          {r.photo_path && (
            <img src={photoUrl(r.photo_path)} alt={r.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-xl">{r.title}</h2>
              <span className="shrink-0 rounded-full bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
                {groupName(r.group_id) ?? 'Privée'}
              </span>
            </div>
            {r.ingredients.length > 0 && (
              <>
                <h3 className="mt-3 text-sm font-bold uppercase text-primary">Ingrédients</h3>
                <ul className="list-inside list-disc">
                  {r.ingredients.map((i, idx) => <li key={idx}>{formatIngredient(i)}</li>)}
                </ul>
              </>
            )}
            <h3 className="mt-3 text-sm font-bold uppercase text-primary">Préparation</h3>
            <p className="whitespace-pre-line">{r.steps}</p>
            {r.owner_id === session?.user.id && (
              <button className="mt-3 text-sm underline" onClick={() => deleteRecipe(r).then(recipes.reload)}>Supprimer</button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
