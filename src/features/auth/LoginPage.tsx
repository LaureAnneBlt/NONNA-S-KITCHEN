import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import Doors from '../../components/Doors';

export default function LoginPage({ open = false }: { open?: boolean }) {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    const { error } = signup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else if (signup) setMsg('Vérifie ta boîte mail pour confirmer ton compte 🍝');
    setBusy(false);
  }

  return (
    <>
      <Doors open={open} />
      <div className={`login-layer ${open ? 'is-open' : ''}`}>
        <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center p-6">
          <div className="sign-wrap">
            <span className="sign-nail" />
            <svg className="sign-cords" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
              <path d="M50 0 L12 40 M50 0 L88 40" />
            </svg>
            <div className="sign flex flex-col gap-4">
              <header className="text-center">
                <p className="text-5xl">🍅</p>
                <h1 className="font-display text-4xl font-semibold italic text-primary">Nonna Mia</h1>
                <p className="mt-1 text-sm text-muted">Les recettes de la famiglia, toutes au même endroit.</p>
              </header>
              <form onSubmit={submit} className="flex flex-col gap-3">
                <input className="input" type="email" placeholder="Email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className="input" type="password" placeholder="Mot de passe (6+ caractères)" autoComplete={signup ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
                {msg && <p className="text-sm font-semibold text-primary">{msg}</p>}
                <button className="btn" disabled={busy}>{signup ? 'Créer mon compte' : 'Entrer en cuisine'}</button>
                <button type="button" className="text-sm underline" onClick={() => setSignup(!signup)}>
                  {signup ? 'J’ai déjà un compte' : 'Pas encore de compte ?'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
