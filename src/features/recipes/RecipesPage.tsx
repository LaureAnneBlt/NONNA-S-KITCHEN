import { Link } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { listRecipes, deleteRecipe } from './api';
import { listGroups } from '../groups/api';
import { useAuth } from '../auth/AuthProvider';

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
        <article key={r.id} className="card">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-xl">{r.title}</h2>
            <span className="shrink-0 rounded-full bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
              {groupName(r.group_id) ?? 'Privée'}
            </span>
          </div>
          <h3 className="mt-3 text-sm font-bold uppercase text-primary">Ingrédients</h3>
          <p className="whitespace-pre-line">{r.ingredients}</p>
          <h3 className="mt-3 text-sm font-bold uppercase text-primary">Préparation</h3>
          <p className="whitespace-pre-line">{r.steps}</p>
          {r.owner_id === session?.user.id && (
            <button className="mt-3 text-sm underline" onClick={() => deleteRecipe(r.id).then(recipes.reload)}>
              Supprimer
            </button>
          )}
        </article>
      ))}
    </section>
  );
}
