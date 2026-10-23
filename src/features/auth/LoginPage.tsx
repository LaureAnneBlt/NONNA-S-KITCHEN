import { useRef, useState, type FormEvent } from "react";
import { authLinkError, supabase } from "../../lib/supabase";
import { useAuth } from "./AuthProvider";
import Doors from "../../components/Doors";
import Tomato from "../../components/Tomato";
import { Icon } from "../../components/Icons";
import { frenchError } from "../../lib/errors";
import OtpInput from "./OtpInput";

type Mode = "signin" | "signup" | "forgot" | "code" | "reset";
type CodeFor = "signup" | "recovery";

const SUBMIT: Record<Mode, string> = {
  signin: "Entrer en cuisine",
  signup: "Créer mon compte",
  forgot: "Recevoir un code",
  code: "Valider le code",
  reset: "Enregistrer et entrer",
};

export default function LoginPage({ open = false }: { open?: boolean }) {
  const { recovery, startRecovery, endRecovery } = useAuth();
  const [chosen, setChosen] = useState<Mode>("signin");
  const mode: Mode = recovery ? "reset" : chosen;
  const [codeFor, setCodeFor] = useState<CodeFor>("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok?: boolean } | null>(
    authLinkError
      ? {
          text: "Ce lien a expiré ou a déjà servi. Si ton adresse est déjà confirmée, connecte-toi simplement.",
        }
      : null,
  );
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const go = (next: Mode) => {
    setChosen(next);
    setMsg(null);
  };

  const askCode = (purpose: CodeFor) => {
    setCodeFor(purpose);
    setCode("");
    setChosen("code");
    setMsg(null);
  };

  const sendCode = (purpose: CodeFor) =>
    purpose === "signup"
      ? supabase.auth.resend({ type: "signup", email })
      : supabase.auth.resetPasswordForEmail(email);

  async function verify() {
    if (codeFor === "recovery") startRecovery();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.replace(/\s/g, ""),
      type: codeFor === "signup" ? "signup" : "recovery",
    });
    if (!error) return null;
    endRecovery();
    return { code: "otp_expired" };
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    (document.activeElement as HTMLElement | null)?.blur();
    setBusy(true);
    setMsg(null);
    let error: { message?: string; code?: string } | null = null;
    if (mode === "signup") {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() } },
      });
      error = res.error;
      if (!error && !res.data.session) askCode("signup");
    } else if (mode === "forgot") {
      error = (await sendCode("recovery")).error;
      if (!error) askCode("recovery");
    } else if (mode === "code") {
      error = await verify();
    } else if (mode === "reset") {
      error = (await supabase.auth.updateUser({ password })).error;
      if (!error) endRecovery();
    } else {
      error = (await supabase.auth.signInWithPassword({ email, password }))
        .error;
      if (error?.code === "email_not_confirmed") {
        askCode("signup");
        await sendCode("signup");
      }
    }
    inFlight.current = false;
    setBusy(false);
    if (error) setMsg({ text: frenchError(error) });
  }

  async function resend() {
    setMsg(null);
    const { error } = await sendCode(codeFor);
    setMsg(
      error
        ? { text: frenchError(error) }
        : { text: "Nouveau code envoyé.", ok: true },
    );
  }

  return (
    <>
      <Doors open={open} />
      <div className={`login-layer ${open ? "is-open" : ""}`}>
        <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center p-6">
          <div className="sign-wrap">
            <span className="sign-nail" />
            <svg
              className="sign-cords"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M50 0 L12 40 M50 0 L88 40" />
            </svg>
            <div className="sign flex flex-col gap-4">
              <header className="flex flex-col items-center text-center">
                <Tomato size={58} />
                <h1 className="mt-3 font-display text-[2.15rem] font-semibold italic leading-none text-primary">
                  Nonna’s Kitchen
                </h1>
                <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-accent">
                  Cucina di famiglia
                </p>
                <div className="rule mt-4 w-24" />
                <p className="mt-1 text-sm text-muted empty:hidden">
                  {mode === "signup" ? (
                    "Bienvenue à table ! Crée ton compte en quelques secondes."
                  ) : mode === "forgot" ? (
                    "Indique ton email : on t’envoie un code pour choisir un nouveau mot de passe."
                  ) : mode === "code" ? (
                    <>
                      Entre le code à 6 chiffres envoyé à
                      <br />
                      <strong className="break-all font-semibold text-fg">
                        {email}
                      </strong>
                    </>
                  ) : mode === "reset" ? (
                    "Choisis ton nouveau mot de passe."
                  ) : (
                    ""
                  )}
                </p>
              </header>
              <form onSubmit={submit} className="flex flex-col gap-3">
                {mode === "code" && (
                  <div className="flex flex-col items-center gap-2 pb-1">
                    <OtpInput value={code} onChange={setCode} />
                    <p className="text-xs text-muted">
                      Rien reçu ? Regarde dans les spams.
                    </p>
                  </div>
                )}
                {mode === "signup" && (
                  <div>
                    <label htmlFor="login-name" className="field-label">
                      Ton prénom
                    </label>
                    <input
                      id="login-name"
                      className="input"
                      placeholder="Visible par ta famille"
                      autoComplete="given-name"
                      maxLength={40}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                {(mode === "signin" ||
                  mode === "signup" ||
                  mode === "forgot") && (
                  <div>
                    <label htmlFor="login-email" className="field-label">
                      Email
                    </label>
                    <input
                      id="login-email"
                      className="input"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}
                {(mode === "signin" ||
                  mode === "signup" ||
                  mode === "reset") && (
                  <div>
                    <label htmlFor="login-password" className="field-label">
                      {mode === "reset"
                        ? "Nouveau mot de passe"
                        : "Mot de passe"}
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        className="input pr-12"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          mode === "signin"
                            ? "current-password"
                            : "new-password"
                        }
                        minLength={6}
                        required
                        placeholder={
                          mode === "signin" ? undefined : "6 caractères minimum"
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                        aria-pressed={showPassword}
                        className="icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon
                          name={showPassword ? "eyeOff" : "eye"}
                          size={19}
                        />
                      </button>
                    </div>
                  </div>
                )}
                {mode === "signin" && (
                  <button
                    type="button"
                    className="-mt-1 self-end py-1 text-sm font-semibold text-muted underline underline-offset-2"
                    onClick={() => go("forgot")}
                  >
                    Mot de passe oublié ?
                  </button>
                )}
                {msg && (
                  <p
                    role={msg.ok ? "status" : "alert"}
                    className={`text-sm font-semibold ${msg.ok ? "text-accent" : "text-primary"}`}
                  >
                    {msg.text}
                  </p>
                )}
                <button className="btn" disabled={busy}>
                  {SUBMIT[mode]}
                </button>
                {mode === "code" && (
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <button
                      type="button"
                      className="underline underline-offset-2"
                      onClick={resend}
                    >
                      Renvoyer le code
                    </button>
                    <span className="text-subtle" aria-hidden="true">
                      ·
                    </span>
                    <button
                      type="button"
                      className="underline underline-offset-2"
                      onClick={() => go("signin")}
                    >
                      Retour
                    </button>
                  </div>
                )}
                {mode !== "reset" && mode !== "code" && (
                  <p className="text-center text-sm text-muted">
                    {mode === "signin"
                      ? "Pas encore de compte ? "
                      : mode === "signup"
                        ? "Déjà un compte ? "
                        : ""}
                    <button
                      type="button"
                      className="link underline"
                      onClick={() =>
                        go(mode === "signin" ? "signup" : "signin")
                      }
                    >
                      {mode === "signin"
                        ? "Créer un compte"
                        : mode === "signup"
                          ? "Se connecter"
                          : "Retour à la connexion"}
                    </button>
                  </p>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
