import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { authLinkError, supabase } from "../../lib/supabase";
import { useAuth } from "./AuthProvider";
import Doors from "../../components/Doors";
import {
  Button,
  cn,
  Field,
  Icon,
  IconButton,
  Input,
  Message,
  Rule,
  TextButton,
  Tomato,
} from "../../ui";
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
      <div
        className={cn(
          "fixed inset-0 z-50 overflow-y-auto overscroll-contain pt-[env(safe-area-inset-top)] pb-(--kb-inset,0px) transition-[opacity,scale] duration-350 ease-[ease]",
          open && "pointer-events-none scale-[1.06] opacity-0",
        )}
      >
        <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center p-6">
          <HangingSign>
            <header className="flex flex-col items-center text-center">
              <Tomato size={58} />
              <h1 className="mt-3 font-display text-[2.15rem] font-semibold italic leading-none text-primary">
                Nonna’s Kitchen
              </h1>
              <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-accent">
                Cucina di famiglia
              </p>
              <Rule className="mt-4 w-24" />
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
                <Field label="Ton prénom" htmlFor="login-name">
                  <Input
                    id="login-name"
                    placeholder="Visible par ta famille"
                    autoComplete="given-name"
                    maxLength={40}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
              )}
              {(mode === "signin" ||
                mode === "signup" ||
                mode === "forgot") && (
                <Field label="Email" htmlFor="login-email">
                  <Input
                    id="login-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
              )}
              {(mode === "signin" || mode === "signup" || mode === "reset") && (
                <Field
                  label={
                    mode === "reset" ? "Nouveau mot de passe" : "Mot de passe"
                  }
                  htmlFor="login-password"
                >
                  <div className="relative">
                    <Input
                      id="login-password"
                      className="pr-12"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      minLength={6}
                      required
                      placeholder={
                        mode === "signin" ? undefined : "6 caractères minimum"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <IconButton
                      label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Icon name={showPassword ? "eyeOff" : "eye"} size={19} />
                    </IconButton>
                  </div>
                </Field>
              )}
              {mode === "signin" && (
                <TextButton
                  className="-mt-1 self-end py-1 text-sm font-semibold text-muted"
                  onClick={() => go("forgot")}
                >
                  Mot de passe oublié ?
                </TextButton>
              )}
              {msg && (
                <Message tone={msg.ok ? "success" : "error"}>
                  {msg.text}
                </Message>
              )}
              <Button disabled={busy}>{SUBMIT[mode]}</Button>
              {mode === "code" && (
                <div className="flex items-center justify-center gap-3 text-sm">
                  <TextButton onClick={resend}>Renvoyer le code</TextButton>
                  <span className="text-subtle" aria-hidden="true">
                    ·
                  </span>
                  <TextButton onClick={() => go("signin")}>Retour</TextButton>
                </div>
              )}
              {mode !== "reset" && mode !== "code" && (
                <p className="text-center text-sm text-muted">
                  {mode === "signin"
                    ? "Pas encore de compte ? "
                    : mode === "signup"
                      ? "Déjà un compte ? "
                      : ""}
                  <TextButton
                    strong
                    onClick={() => go(mode === "signin" ? "signup" : "signin")}
                  >
                    {mode === "signin"
                      ? "Créer un compte"
                      : mode === "signup"
                        ? "Se connecter"
                        : "Retour à la connexion"}
                  </TextButton>
                </p>
              )}
            </form>
          </HangingSign>
        </main>
      </div>
    </>
  );
}

const SCREWS = [
  "left-[0.4rem] top-[0.4rem]",
  "right-[0.4rem] top-[0.4rem]",
  "bottom-[0.4rem] left-[0.4rem]",
  "bottom-[0.4rem] right-[0.4rem]",
];

function HangingSign({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-12 origin-[50%_-2.6rem] animate-sway motion-reduce:animate-none">
      <span className="absolute -top-12 left-1/2 z-2 -ml-2 size-4 rounded-full bg-radial-[circle_at_35%_30%] from-brass-light via-brass via-60% to-brass-700 shadow-[0_2px_4px_rgb(0_0_0/0.5)]" />
      <svg
        className="absolute inset-x-0 top-[-2.6rem] h-[2.8rem] w-full overflow-visible"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M50 0 L12 40 M50 0 L88 40"
          className="fill-none stroke-rope stroke-[2.5] [vector-effect:non-scaling-stroke]"
        />
      </svg>
      <div className="relative z-1 flex flex-col gap-4 rounded-[1.1rem] border-6 border-wood bg-gingham px-[1.4rem] py-7 shadow-sign [--gingham-alpha:16%] [--gingham-size:20px]">
        {SCREWS.map((position) => (
          <span
            key={position}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute size-2.25 bg-[radial-gradient(circle,var(--color-brass)_0_2.5px,var(--color-brass-700)_3px,transparent_3.5px)]",
              position,
            )}
          />
        ))}
        {children}
      </div>
    </div>
  );
}
