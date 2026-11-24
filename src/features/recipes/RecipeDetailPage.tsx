import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAsync } from "../../lib/useAsync";
import { useWakeLock } from "../../lib/useWakeLock";
import { useCookingProgress } from "../../lib/useCookingProgress";
import { frenchError } from "../../lib/errors";
import { deleteRecipe, getRecipe, photoUrl, setFavorite } from "./api";
import { formatDuration, formatQuantity } from "./format";
import { listGroups } from "../groups/api";
import { useAuth } from "../auth/AuthProvider";
import { useConfirm } from "../../components/Confirm";
import {
  Button,
  ButtonLink,
  Card,
  cn,
  Icon,
  IconButton,
  Leader,
  MenuHeading,
  Message,
  Ornament,
  PageTitle,
  Photo,
  Skeleton,
  StepNumber,
  Tag,
  TopBar,
  type IconName,
} from "../../ui";

function Fact({ icon, children }: { icon: IconName; children: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted">
      <span className="text-wood">
        <Icon name={icon} size={16} />
      </span>
      {children}
    </span>
  );
}

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const load = useCallback(() => getRecipe(id!), [id]);
  const { data: r, loading, error } = useAsync(load);
  const groups = useAsync(listGroups);
  const progress = useCookingProgress(id!);
  const [confirm, dialog] = useConfirm();
  const [deleteError, setDeleteError] = useState("");
  const [favorite, setFavoriteState] = useState<boolean | null>(null);
  const [favoriteError, setFavoriteError] = useState("");
  useWakeLock();

  if (loading)
    return (
      <div className="flex flex-col gap-5">
        <TopBar to="/" label="Recettes" />
        <Skeleton className="aspect-4/3" />
        <Skeleton className="h-9 w-2/3 rounded-lg" />
      </div>
    );
  if (error || !r)
    return (
      <div className="flex flex-col gap-5">
        <TopBar to="/" label="Recettes" />
        <Card as="p" className="p-6 text-center text-muted">
          {error ?? "Recette introuvable."}
        </Card>
      </div>
    );

  const steps = r.steps
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const isOwner = r.owner_id === session?.user.id;
  const groupNames = r.group_ids
    .map((id) => groups.data?.find((g) => g.id === id)?.name)
    .filter(Boolean) as string[];
  const started = progress.ingredients.size + progress.steps.size > 0;
  const isFavorite = favorite ?? r.favorite;

  async function toggleFavorite() {
    const next = !isFavorite;
    setFavoriteState(next);
    setFavoriteError("");
    try {
      await setFavorite(r!.id, next);
    } catch (e) {
      setFavoriteState(!next);
      setFavoriteError(frenchError(e));
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "Supprimer cette recette ?",
      message: `« ${r!.title} » disparaîtra pour toi et pour les familles avec qui elle est partagée.`,
      confirmLabel: "Supprimer",
    });
    if (!ok) return;
    try {
      await deleteRecipe(r!);
      progress.reset();
      navigate("/", { replace: true });
    } catch (e) {
      setDeleteError(frenchError(e));
    }
  }

  return (
    <article className="flex animate-pop flex-col gap-6">
      <TopBar to="/" label="Recettes">
        <IconButton
          variant="outlined"
          size="sm"
          label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={isFavorite}
          className={cn(isFavorite && "text-primary")}
          onClick={toggleFavorite}
        >
          <Icon name="heart" size={17} filled={isFavorite} />
        </IconButton>
        {isOwner && (
          <ButtonLink
            to={`/recettes/${r.id}/modifier`}
            variant="secondary"
            size="xs"
          >
            <Icon name="edit" size={15} />
            Modifier
          </ButtonLink>
        )}
      </TopBar>
      {favoriteError && <Message className="-mt-3">{favoriteError}</Message>}

      {r.photo_path && (
        <Card className="p-1.5">
          <Photo
            src={photoUrl(r.photo_path)}
            alt={r.title}
            className="aspect-4/3"
          />
        </Card>
      )}

      <header className="flex flex-col items-center gap-3 text-center">
        <PageTitle>{r.title}</PageTitle>
        <p className="-mt-1 font-display text-[1.0625rem] italic text-wood">
          {isOwner ? "Ta recette" : `La recette de ${r.author}`}
        </p>
        <Ornament className="w-24" />
        {!!(r.servings || r.prep_minutes || r.cook_minutes) && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {!!r.servings && (
              <Fact icon="utensils">{`${r.servings} pers.`}</Fact>
            )}
            {!!r.prep_minutes && (
              <Fact icon="clock">{`Prépa ${formatDuration(r.prep_minutes)}`}</Fact>
            )}
            {!!r.cook_minutes && (
              <Fact icon="flame">{`Cuisson ${formatDuration(r.cook_minutes)}`}</Fact>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {groupNames.length ? (
            groupNames.map((n) => (
              <Tag key={n}>
                <Icon name="users" size={12} />
                {n}
              </Tag>
            ))
          ) : (
            <Tag muted>
              <Icon name="lock" size={12} />
              Privée
            </Tag>
          )}
        </div>
      </header>

      {r.ingredients.length > 0 && (
        <Card as="section" menu className="px-6 pb-4 pt-6">
          <MenuHeading>Ingrédients</MenuHeading>
          <p className="mt-1 text-center text-xs text-subtle">
            {progress.ingredients.size
              ? `${progress.ingredients.size} sur ${r.ingredients.length} cochés`
              : "Touche un ingrédient pour le cocher"}
          </p>
          <ul className="mt-3">
            {r.ingredients.map((ing, i) => {
              const on = progress.ingredients.has(i);
              return (
                <li key={i}>
                  <button
                    onClick={() => progress.toggleIngredient(i)}
                    aria-pressed={on}
                    className={cn(
                      "flex w-full items-baseline gap-2.5 py-2 text-left transition",
                      on && "opacity-55",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 translate-y-0.5 place-items-center self-center rounded-full border border-wood/50 transition",
                        on && "border-accent bg-accent text-on-primary",
                      )}
                    >
                      {on && <Icon name="check" size={12} />}
                    </span>
                    <span className={cn(on && "line-through")}>
                      {ing.name.charAt(0).toUpperCase() + ing.name.slice(1)}
                      {ing.optional && (
                        <span className="ml-1.5 text-sm italic text-subtle">
                          facultatif
                        </span>
                      )}
                    </span>
                    <Leader />
                    <span className="shrink-0 font-display italic text-wood">
                      {formatQuantity(ing)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {steps.length > 0 && (
        <section className="px-1">
          <MenuHeading>Préparation</MenuHeading>
          <p className="mt-1 text-center text-xs text-subtle">
            {progress.steps.size
              ? `${progress.steps.size} sur ${steps.length} étapes faites`
              : "Touche une étape une fois terminée"}
          </p>
          <ol className="mt-4 flex flex-col gap-1">
            {steps.map((s, i) => {
              const done = progress.steps.has(i);
              return (
                <li key={i}>
                  <button
                    onClick={() => progress.toggleStep(i)}
                    aria-pressed={done}
                    className={cn(
                      "-mx-2 flex w-[calc(100%+1rem)] gap-4 rounded-xl px-2 py-2.5 text-left transition active:bg-line",
                      done && "opacity-55",
                    )}
                  >
                    <StepNumber className="grid w-6 shrink-0 justify-items-end pt-0.5">
                      {done ? (
                        <span className="grid size-6 place-items-center rounded-full bg-accent text-on-primary">
                          <Icon name="check" size={14} />
                        </span>
                      ) : (
                        i + 1
                      )}
                    </StepNumber>
                    <span className="leading-relaxed">{s}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {started && (
        <Button
          variant="secondary"
          size="sm"
          className="self-center"
          onClick={progress.reset}
        >
          <Icon name="reset" size={16} />
          Tout décocher
        </Button>
      )}

      <p className="text-center text-xs text-subtle">
        Ajoutée le{" "}
        {new Date(r.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {isOwner && (
        <div className="-mt-3 flex flex-col items-center">
          <Button variant="danger" onClick={remove}>
            <Icon name="trash" size={16} />
            Supprimer la recette
          </Button>
          {deleteError && <Message>{deleteError}</Message>}
        </div>
      )}
      {dialog}
    </article>
  );
}
