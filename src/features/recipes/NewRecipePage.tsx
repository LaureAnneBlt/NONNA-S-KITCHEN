import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { listGroups } from '../groups/api';
import { createRecipe, type Ingredient } from './api';
import IngredientsEditor, { emptyIngredient } from './IngredientsEditor';

export default function NewRecipePage() {
  const navigate = useNavigate();
  const groups = useAsync(listGroups);
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState('');
  const [groupId, setGroupId] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!photo) return setPreview(null);
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createRecipe({
        title, steps, photo,
        ingredients: ingredients.filter((i) => i.name.trim()),
        group_id: groupId || null,
      });
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <h1 className="title">Nuova ricetta</h1>
      <input className="input" placeholder="Nom de la recette" required value={title} onChange={(e) => setTitle(e.target.value)} />

      <label className="card flex cursor-pointer flex-col items-center gap-2 border-dashed p-0 text-center text-muted">
        {preview
          ? <img src={preview} alt="Aperçu" className="aspect-[4/3] w-full rounded-card object-cover" />
          : <span className="p-6">📷 Ajouter une photo</span>}
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      </label>

      <IngredientsEditor value={ingredients} onChange={setIngredients} />
      <textarea className="input" rows={7} placeholder="Préparation" value={steps} onChange={(e) => setSteps(e.target.value)} />
      <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
        <option value="">🔒 Privée (juste moi)</option>
        {groups.data?.map((g) => <option key={g.id} value={g.id}>👨‍👩‍👧 {g.name}</option>)}
      </select>
      {error && <p className="text-primary">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Envoi…' : 'Enregistrer'}</button>
    </form>
  );
}
