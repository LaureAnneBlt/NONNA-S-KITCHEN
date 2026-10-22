import { useState, type FormEvent } from 'react';
import { useAsync } from '../../lib/useAsync';
import { listGroups, createGroup, joinGroup } from './api';

export default function GroupsPage() {
  const groups = useAsync(listGroups);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const run = (action: () => Promise<void>, reset: () => void) => async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try { await action(); reset(); groups.reload(); } catch (err) { setError((err as Error).message); }
  };

  return (
    <section className="flex flex-col gap-4">
      <h1 className="title">Le famiglie</h1>
      {groups.data?.map((g) => (
        <article key={g.id} className="card">
          <h2 className="font-display text-xl">{g.name}</h2>
          <p className="text-sm text-muted">Code d’invitation : <b className="select-all tracking-widest">{g.invite_code}</b></p>
        </article>
      ))}
      <form className="card flex gap-2" onSubmit={run(() => createGroup(name), () => setName(''))}>
        <input className="input" placeholder="Nom de la famille" required value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn">Créer</button>
      </form>
      <form className="card flex gap-2" onSubmit={run(() => joinGroup(code), () => setCode(''))}>
        <input className="input" placeholder="Code d’invitation" required value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="btn">Rejoindre</button>
      </form>
      {error && <p className="text-primary">{error}</p>}
    </section>
  );
}
