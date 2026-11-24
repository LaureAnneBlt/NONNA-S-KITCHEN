import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../../lib/useAsync";
import { useAuth } from "../auth/AuthProvider";
import { getRecipe } from "./api";
import RecipeForm from "./RecipeForm";
import { Card, Skeleton } from "../../ui";

export default function EditRecipePage() {
  const { id } = useParams();
  const { session } = useAuth();
  const load = useCallback(() => getRecipe(id!), [id]);
  const { data: recipe, loading, error } = useAsync(load);

  if (loading) return <Skeleton className="h-64" />;
  if (error || !recipe)
    return (
      <Card as="p" className="p-6 text-center text-muted">
        Recette introuvable.
      </Card>
    );
  if (recipe.owner_id !== session?.user.id)
    return (
      <Card as="p" className="p-6 text-center text-muted">
        Seule la personne qui a créé cette recette peut la modifier.
      </Card>
    );
  return <RecipeForm recipe={recipe} />;
}
