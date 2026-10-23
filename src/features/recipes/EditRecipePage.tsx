import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../../lib/useAsync";
import { useAuth } from "../auth/AuthProvider";
import { getRecipe } from "./api";
import RecipeForm from "./RecipeForm";

export default function EditRecipePage() {
  const { id } = useParams();
  const { session } = useAuth();
  const load = useCallback(() => getRecipe(id!), [id]);
  const { data: recipe, loading, error } = useAsync(load);

  if (loading) return <div className="skeleton h-64" />;
  if (error || !recipe)
    return (
      <p className="card p-6 text-center text-muted">Recette introuvable.</p>
    );
  if (recipe.owner_id !== session?.user.id)
    return (
      <p className="card p-6 text-center text-muted">
        Seule la personne qui a créé cette recette peut la modifier.
      </p>
    );
  return <RecipeForm recipe={recipe} />;
}
