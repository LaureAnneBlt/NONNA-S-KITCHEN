import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import { useConfirm } from "../../components/Confirm";
import { frenchError } from "../../lib/errors";
import {
  Button,
  Card,
  Field,
  Icon,
  Input,
  Label,
  MenuHeading,
  Message,
  PageHeader,
  Plate,
  TopBar,
} from "../../ui";
import { useAsync } from "../../lib/useAsync";
import { listGroups } from "../groups/api";
import {
  createRecipe,
  photoUrl,
  updateRecipe,
  type Ingredient,
  type Recipe,
} from "./api";
import IngredientsEditor, { emptyIngredient } from "./IngredientsEditor";
import StepsEditor from "./StepsEditor";
import GroupPicker from "./GroupPicker";

const toSteps = (text: string) => {
  const s = text
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  return s.length ? s : [""];
};

const toNumber = (text: string) => {
  const n = parseInt(text, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

function NumberField({
  id,
  label,
  suffix,
  value,
  onChange,
}: {
  id: string;
  label: string;
  suffix: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label} htmlFor={id} className="min-w-0">
      <div className="relative">
        <Input
          id={id}
          className="pr-11"
          inputMode="numeric"
          placeholder="–"
          maxLength={4}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-subtle">
          {suffix}
        </span>
      </div>
    </Field>
  );
}

export default function RecipeForm({ recipe }: { recipe?: Recipe }) {
  const navigate = useNavigate();
  const groups = useAsync(listGroups);
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(recipe?.title ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients.length ? recipe.ingredients : [emptyIngredient()],
  );
  const [steps, setSteps] = useState<string[]>(() =>
    toSteps(recipe?.steps ?? ""),
  );
  const [groupIds, setGroupIds] = useState<string[]>(recipe?.group_ids ?? []);
  const [servings, setServings] = useState(String(recipe?.servings ?? ""));
  const [prep, setPrep] = useState(String(recipe?.prep_minutes ?? ""));
  const [cook, setCook] = useState(String(recipe?.cook_minutes ?? ""));
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, dialog] = useConfirm();

  const snapshot = JSON.stringify([
    title,
    ingredients,
    steps,
    groupIds,
    servings,
    prep,
    cook,
  ]);
  const initial = useRef(snapshot);
  const saved = useRef(false);
  const dirty = snapshot !== initial.current || !!photo || removePhoto;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !saved.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  const blockerRef = useRef(blocker);
  blockerRef.current = blocker;
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    confirm({
      title: "Quitter sans enregistrer ?",
      message: recipe
        ? "Tes modifications seront perdues."
        : "La recette que tu as commencée sera perdue.",
      confirmLabel: "Quitter sans enregistrer",
      cancelLabel: "Continuer à écrire",
    }).then((ok) =>
      ok ? blockerRef.current.proceed?.() : blockerRef.current.reset?.(),
    );
  }, [blocker.state]);

  useEffect(() => {
    if (!photo) return setPreview(null);
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const shownPhoto =
    preview ??
    (!removePhoto && recipe?.photo_path ? photoUrl(recipe.photo_path) : null);
  const back = recipe ? `/recettes/${recipe.id}` : "/";

  function dropPhoto() {
    setPhoto(null);
    setRemovePhoto(true);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const input = {
      title: title.trim(),
      steps: steps
        .map((s) => s.trim())
        .filter(Boolean)
        .join("\n"),
      ingredients: ingredients
        .filter((i) => i.name.trim())
        .map((i) => ({ ...i, name: i.name.trim() })),
      group_ids: groupIds,
      servings: toNumber(servings),
      prep_minutes: toNumber(prep),
      cook_minutes: toNumber(cook),
    };
    try {
      const id = recipe ? recipe.id : await createRecipe(input, photo);
      if (recipe)
        await updateRecipe(recipe, input, { file: photo, remove: removePhoto });
      saved.current = true;
      navigate(`/recettes/${id}`, { replace: !recipe });
    } catch (err) {
      setError(frenchError(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <TopBar to={back} label={recipe ? "Recette" : "Recettes"} />
      <PageHeader
        eyebrow={recipe ? "Modifica" : "Nuova ricetta"}
        title={recipe ? "Modifier la recette" : "Nouvelle recette"}
      />

      <Card as="section" menu className="flex flex-col gap-5 p-6">
        <Field label="Nom de la recette" htmlFor="title">
          <Input
            id="title"
            required
            placeholder="Ex : lasagnes de Nonna"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <NumberField
            id="servings"
            label="Pour"
            suffix="pers."
            value={servings}
            onChange={setServings}
          />
          <NumberField
            id="prep"
            label="Prépa"
            suffix="min"
            value={prep}
            onChange={setPrep}
          />
          <NumberField
            id="cook"
            label="Cuisson"
            suffix="min"
            value={cook}
            onChange={setCook}
          />
        </div>
        <div>
          <Label as="span">Photo</Label>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Choisir une photo"
            onChange={(e) => {
              setPhoto(e.target.files?.[0] ?? null);
              setRemovePhoto(false);
            }}
          />
          {shownPhoto ? (
            <div className="relative overflow-hidden rounded-xl border border-line">
              <img
                src={shownPhoto}
                alt="Aperçu"
                className="aspect-4/3 w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-linear-to-t from-black/45 to-transparent p-3 pt-8">
                <Button
                  type="button"
                  variant="overlay"
                  size="sm"
                  className="h-9"
                  onClick={() => fileInput.current?.click()}
                >
                  Changer
                </Button>
                <Button
                  type="button"
                  variant="overlay"
                  size="sm"
                  className="h-9 text-primary"
                  onClick={dropPhoto}
                >
                  Retirer
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-canvas text-sm font-semibold text-muted transition active:bg-sunken"
            >
              <Plate className="size-12">
                <Icon name="camera" size={22} />
              </Plate>
              Ajouter une photo
            </button>
          )}
        </div>
      </Card>

      <Card as="section" className="p-5">
        <MenuHeading>Ingrédients</MenuHeading>
        <p className="mb-4 mt-1.5 text-center text-sm text-muted">
          Quantité et unité sont facultatives.
        </p>
        <IngredientsEditor value={ingredients} onChange={setIngredients} />
      </Card>

      <Card as="section" className="p-5">
        <MenuHeading>Préparation</MenuHeading>
        <p className="mb-4 mt-1.5 text-center text-sm text-muted">
          Une étape par ligne : <b className="font-semibold text-fg">Entrée</b>{" "}
          passe à la suivante.
        </p>
        <StepsEditor value={steps} onChange={setSteps} />
      </Card>

      <Card as="section" className="p-5">
        <MenuHeading className="mb-4">Partager avec</MenuHeading>
        <GroupPicker
          groups={groups.data ?? []}
          value={groupIds}
          onChange={setGroupIds}
        />
      </Card>

      {error && <Message>{error}</Message>}
      <Button disabled={busy}>
        {busy
          ? "Enregistrement…"
          : recipe
            ? "Enregistrer les modifications"
            : "Enregistrer la recette"}
      </Button>
      {dialog}
    </form>
  );
}
