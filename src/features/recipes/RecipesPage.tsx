import { useState } from "react";
import { Link } from "react-router-dom";
import { useAsync } from "../../lib/useAsync";
import { listRecipes, photoUrl, type Recipe } from "./api";
import { listGroups } from "../groups/api";
import { useAuth } from "../auth/AuthProvider";
import { Icon } from "../../components/Icons";
import { PageHeader } from "../../components/PageHeader";
import Tomato from "../../components/Tomato";

const plural = (n: number) => `${n} recette${n > 1 ? "s" : ""}`;

export function PhotoPlaceholder({ size = 40 }: { size?: number }) {
  return (
    <div className="gingham grid h-full w-full place-items-center">
      <span className="plate">
        <Tomato size={size} />
      </span>
    </div>
  );
}

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
    <Link
      to={`/recettes/${r.id}`}
      className="print flex animate-pop flex-col transition active:scale-[0.98]"
    >
      {r.photo_path ? (
        <img
          src={photoUrl(r.photo_path)}
          alt=""
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="photo aspect-square overflow-hidden">
          <PhotoPlaceholder />
        </div>
      )}
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
    </Link>
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
            <input
              className="input pl-10"
              type="search"
              placeholder="Une recette, un ingrédient, un prénom…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 scrollbar-none">
            {filters.map((f) => (
              <button
                key={f.id}
                aria-pressed={filter === f.id}
                className={`filter ${filter === f.id ? "is-on" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {recipes.error && (
        <p className="text-sm font-semibold text-primary" role="alert">
          {recipes.error}
        </p>
      )}
      {recipes.loading && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton aspect-4/5" />
          ))}
        </div>
      )}

      {empty && (
        <div className="card card-menu flex flex-col items-center px-6 py-10 text-center">
          <span className="plate">
            <Tomato size={40} />
          </span>
          <h2 className="section-title mt-5 italic">Le ricettario est vide</h2>
          <p className="mt-1.5 max-w-[16rem] text-sm text-muted">
            Commence par la recette que tout le monde te réclame.
          </p>
          <Link to="/recettes/nouvelle" className="btn btn-sm mt-6">
            <Icon name="plus" size={18} />
            Ajouter une recette
          </Link>
        </div>
      )}
      {!empty && visible?.length === 0 && (
        <div className="py-10 text-center">
          <h2 className="section-title">Aucune recette trouvée</h2>
          <p className="mt-1.5 text-sm text-muted">
            Essaie un autre mot ou un autre filtre.
          </p>
        </div>
      )}

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
