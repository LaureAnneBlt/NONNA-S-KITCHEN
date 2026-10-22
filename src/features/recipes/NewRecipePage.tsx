import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { listGroups } from '../groups/api';
import { createRecipe } from './api';

export default function NewRecipePage() {
  const navigate = useNavigate();
  const groups = useAsync(listGroups);
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await createRecipe({ title, ingredients, steps, group_id: groupId || null });
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <h1 className="title">Nuova ricetta</h1>
      <input className="input" placeholder="Nom de la recette" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="input" rows={5} placeholder="Ingrédients (un par ligne)" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
      <textarea className="input" rows={7} placeholder="Préparation" value={steps} onChange={(e) => setSteps(e.target.value)} />
      <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
        <option value="">🔒 Privée (juste moi)</option>
        {groups.data?.map((g) => <option key={g.id} value={g.id}>👨‍👩‍👧 {g.name}</option>)}
      </select>
      {error && <p className="text-primary">{error}</p>}
      <button className="btn">Enregistrer</button>
    </form>
  );
}
