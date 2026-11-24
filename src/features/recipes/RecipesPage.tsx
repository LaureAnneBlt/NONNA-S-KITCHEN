import { useState } from "react";
import { Link } from "react-router-dom";
import { useAsync } from "../../lib/useAsync";
import { listRecipes, photoUrl, type Recipe } from "./api";
import { listGroups } from "../groups/api";
import { useAuth } from "../auth/AuthProvider";
import {
  ButtonLink,
  Card,
  Chip,
  Icon,
  Input,
  Message,
  PageHeader,
  Photo,
  Plate,
  SectionTitle,
  Skeleton,
  Tomato,
} from "../../ui";

const plural = (n: number) => `${n} recette${n > 1 ? "s" : ""}`;

function RecipeTile({
  recipe: r,
  groupNames,
  mine,
}: {
  recipe: Recipe;
  groupNames: string[];
  mine: boolean;
}) {
  return (
    <Card
      as={Link}
      to={`/recettes/${r.id}`}
      className="relative flex animate-pop flex-col p-1.5 transition active:scale-[0.98]"
    >
      {r.favorite && (
        <span
          className="absolute right-3 top-3 z-10 grid size-7 place-items-center rounded-full bg-surface text-primary shadow-card"
          aria-label="Favorite"
        >
          <Icon name="heart" size={14} filled />
        </span>
      )}
      <Photo
        src={r.photo_path && photoUrl(r.photo_path)}
        lazy
        className="aspect-square"
      />
      <h2 className="mt-2.5 line-clamp-2 px-1.5 font-display text-[1.0625rem] leading-snug font-semibold italic">
        {r.title}
      </h2>
      {mine ? (
        <p className="mb-1.5 mt-1 flex items-center gap-1 px-1.5 text-xs text-muted">
          <Icon name={groupNames.length ? "users" : "lock"} size={12} />
          <span className="truncate">
            {groupNames.length ? groupNames[0] : "Privée"}
            {groupNames.length > 1 && ` +${groupNames.length - 1}`}
          </span>
        </p>
      ) : (
        <p className="mb-1.5 mt-1 truncate px-1.5 font-display text-sm italic text-wood">
          de {r.author}
        </p>
      )}
    </Card>
  );
}

export default function RecipesPage() {
  const { session } = useAuth();
  const recipes = useAsync(listRecipes);
  const groups = useAsync(listGroups);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const groupNames = (ids: string[]) =>
    ids
      .map((id) => groups.data?.find((g) => g.id === id)?.name)
      .filter(Boolean) as string[];

  const q = query.trim().toLowerCase();
  const visible = recipes.data?.filter(
    (r) =>
      (filter === "all" ||
        (filter === "favorites" && r.favorite) ||
        (filter === "private"
          ? r.group_ids.length === 0
          : r.group_ids.includes(filter))) &&
      (!q ||
        r.title.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q))),
  );
  const filters = [
    { id: "all", name: "Toutes" },
    { id: "favorites", name: "Favorites" },
    { id: "private", name: "Privées" },
    ...(groups.data ?? []),
  ];
  const empty = recipes.data?.length === 0;

  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="Il ricettario" title="Les recettes">
        {recipes.data?.length
          ? visible!.length === recipes.data.length
            ? plural(recipes.data.length)
            : `${visible!.length} sur ${plural(recipes.data.length)}`
          : " "}
      </PageHeader>

      {!empty && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">
              <Icon name="search" size={18} />
            </span>
            <Input
              className="pl-10"
              type="search"
              placeholder="Une recette, un ingrédient, un prénom…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 scrollbar-none">
            {filters.map((f) => (
              <Chip
                key={f.id}
                on={filter === f.id}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.id === "favorites" && (
                  <Icon name="heart" size={14} filled={filter === f.id} />
                )}
                {f.name}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {recipes.error && <Message>{recipes.error}</Message>}
      {recipes.loading && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-4/5" />
          ))}
        </div>
      )}

      {empty && (
        <Card
          menu
          className="flex flex-col items-center px-6 py-10 text-center"
        >
          <Plate>
            <Tomato size={40} />
          </Plate>
          <SectionTitle className="mt-5 italic">
            Le ricettario est vide
          </SectionTitle>
          <p className="mt-1.5 max-w-[16rem] text-sm text-muted">
            Commence par la recette que tout le monde te réclame.
          </p>
          <ButtonLink to="/recettes/nouvelle" size="sm" className="mt-6">
            <Icon name="plus" size={18} />
            Ajouter une recette
          </ButtonLink>
        </Card>
      )}
      {!empty &&
        visible?.length === 0 &&
        (filter === "favorites" && !q ? (
          <div className="py-10 text-center">
            <SectionTitle>Pas encore de favorites</SectionTitle>
            <p className="mt-1.5 text-sm text-muted">
              Touche le cœur sur une recette pour la retrouver ici.
            </p>
          </div>
        ) : (
          <div className="py-10 text-center">
            <SectionTitle>Aucune recette trouvée</SectionTitle>
            <p className="mt-1.5 text-sm text-muted">
              Essaie un autre mot ou un autre filtre.
            </p>
          </div>
        ))}

      <div className="grid grid-cols-2 gap-3">
        {visible?.map((r) => (
          <RecipeTile
            key={r.id}
            recipe={r}
            groupNames={groupNames(r.group_ids)}
            mine={r.owner_id === session?.user.id}
          />
        ))}
      </div>
    </section>
  );
}
