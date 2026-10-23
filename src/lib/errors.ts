const BY_CODE: Record<string, string> = {
  invalid_credentials: "Email ou mot de passe incorrect.",
  email_not_confirmed:
    "Ton adresse n’est pas encore confirmée. Entre le code reçu par email.",
  user_already_exists: "Un compte existe déjà avec cet email. Connecte-toi.",
  email_exists: "Un compte existe déjà avec cet email. Connecte-toi.",
  weak_password: "Mot de passe trop faible : 6 caractères minimum.",
  same_password: "Choisis un mot de passe différent de l’ancien.",
  email_address_invalid: "Cette adresse email n’est pas valide.",
  validation_failed: "Vérifie l’email et le mot de passe.",
  otp_expired:
    "Code incorrect ou expiré. Vérifie-le, ou demande-en un nouveau.",
  over_email_send_rate_limit:
    "Trop d’emails envoyés. Patiente quelques minutes avant de réessayer.",
  over_request_rate_limit:
    "Trop de tentatives. Patiente quelques minutes avant de réessayer.",
  "23505": "Cet élément existe déjà.",
};

const BY_MESSAGE: [RegExp, string][] = [
  [
    /failed to fetch|load failed|networkerror|network request failed/i,
    "Pas de connexion internet. Vérifie ton réseau et réessaie.",
  ],
  [/invalid login credentials/i, BY_CODE.invalid_credentials],
  [/already registered/i, BY_CODE.user_already_exists],
  [/password should be at least/i, BY_CODE.weak_password],
  [/exceeded the maximum allowed size/i, "Photo trop lourde."],
  [/jwt expired|invalid jwt/i, "Ta session a expiré. Reconnecte-toi."],
];

export function frenchError(err: unknown): string {
  const e = err as { code?: string; message?: string } | null;
  const code = e?.code ?? "";
  const message = e?.message ?? "";
  if (BY_CODE[code]) return BY_CODE[code];
  for (const [re, text] of BY_MESSAGE) if (re.test(message)) return text;
  if (code === "P0001" && message) return message;
  console.error("Erreur non traduite :", err);
  return "Oups, quelque chose s’est mal passé. Réessaie dans un instant.";
}
