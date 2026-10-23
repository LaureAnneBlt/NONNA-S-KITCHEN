import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useAsync } from "../../lib/useAsync";
import { frenchError } from "../../lib/errors";
import { useAuth } from "../auth/AuthProvider";
import {
  listGroups,
  createGroup,
  joinGroup,
  renameGroup,
  leaveGroup,
  inviteLink,
  type Group,
} from "./api";
import { Icon } from "../../components/Icons";
import { PageHeader } from "../../components/PageHeader";
import { useConfirm } from "../../components/Confirm";

function inviteText(g: Group) {
  return (
    `Rejoins « ${g.name} » sur Nonna’s Kitchen pour partager nos recettes de famille 🍅\n\n` +
    `Code d’invitation : ${g.invite_code}\n` +
    `(dans l’app : onglet Familles → Rejoindre avec un code)\n\n` +
    inviteLink(g.invite_code)
  );
}

function InviteButton({ group }: { group: Group }) {
  const [copied, setCopied] = useState(false);
  async function invite() {
    const text = inviteText(group);
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // partage annulé
      }
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button className="btn btn-sm w-full" onClick={invite}>
      <Icon name={copied ? "check" : "share"} size={17} />
      {copied ? "Invitation copiée" : "Inviter quelqu’un"}
    </button>
  );
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  return (
    <button
      onClick={copy}
      aria-label={`Copier le code ${code}`}
      className={`filter h-8 gap-1.5 px-3 font-semibold tracking-[0.06em] ${copied ? "is-on" : "text-fg"}`}
    >
      {copied ? (
        <>
          <Icon name="check" size={14} />
          Copié
        </>
      ) : (
        <>
          {code}
          <Icon name="copy" size={13} />
        </>
      )}
    </button>
  );
}

function GroupCard({
  group: g,
  isOwner,
  open,
  onToggle,
  onChanged,
}: {
  group: Group;
  isOwner: boolean;
  open: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(g.name);
  const [error, setError] = useState("");
  const [confirm, dialog] = useConfirm();

  async function rename(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await renameGroup(g.id, name);
      setRenaming(false);
      onChanged();
    } catch (err) {
      setError(frenchError(err));
    }
  }

  async function leave() {
    const ok = await confirm({
      title: `Quitter « ${g.name} » ?`,
      message:
        "Tu ne verras plus les recettes de cette famille, et tes recettes ne seront plus partagées avec elle. Tu pourras revenir avec le code d’invitation.",
      confirmLabel: "Quitter la famille",
    });
    if (!ok) return;
    try {
      await leaveGroup(g.id);
      onChanged();
    } catch (err) {
      setError(frenchError(err));
    }
  }

  const count = g.members.length;
  return (
    <li className="card card-menu animate-pop">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-brass bg-door font-display text-lg font-semibold italic text-on-primary shadow-[0_0_0_2px_var(--color-surface),0_0_0_3px_color-mix(in_oklab,var(--color-brass)_40%,transparent)]">
          {g.name[0]?.toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[1.125rem] font-semibold italic">
            {g.name}
          </span>
          <span className="block text-sm text-muted">
            {count} membre{count > 1 ? "s" : ""}
          </span>
        </span>
        <span className={`text-subtle transition ${open ? "rotate-180" : ""}`}>
          <Icon name="chevron" size={20} />
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-5 border-t border-dashed border-line-strong px-5 pb-5 pt-4">
          <div>
            <h3 className="field-label">Membres</h3>
            <ul className="flex flex-wrap gap-1.5">
              {g.members.map((m) => (
                <li key={m.user_id} className="tag tag-muted text-sm">
                  {m.display_name}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2.5">
            <InviteButton group={g} />
            <p className="flex items-center justify-center gap-2 text-sm text-muted">
              ou donne le code
              <CopyCode code={g.invite_code} />
            </p>
          </div>

          {renaming ? (
            <form onSubmit={rename} className="flex flex-col gap-2">
              <label htmlFor={`rename-${g.id}`} className="field-label mb-0">
                Nouveau nom
              </label>
              <div className="flex gap-2">
                <input
                  id={`rename-${g.id}`}
                  className="input"
                  required
                  maxLength={60}
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button className="btn h-auto shrink-0 px-5">OK</button>
              </div>
              <button
                type="button"
                className="self-start text-sm text-muted underline underline-offset-2"
                onClick={() => {
                  setRenaming(false);
                  setName(g.name);
                }}
              >
                Annuler
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {isOwner && (
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => setRenaming(true)}
                >
                  <Icon name="edit" size={15} />
                  Renommer
                </button>
              )}
              <button className="btn-danger" onClick={leave}>
                <Icon name="logout" size={16} />
                Quitter la famille
              </button>
            </div>
          )}
          {error && (
            <p className="text-sm font-semibold text-primary" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
      {dialog}
    </li>
  );
}

export default function GroupsPage() {
  const { session } = useAuth();
  const groups = useAsync(listGroups);
  const [params, setParams] = useSearchParams();
  const invited = params.get("code") ?? "";
  const [name, setName] = useState("");
  const [code, setCode] = useState(invited);

  const [openId, setOpenId] = useState<string | null>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const joinInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!invited) return;
    setCode(invited);
    joinInput.current?.scrollIntoView({ block: "center" });
  }, [invited]);

  const alreadyIn = groups.data?.find(
    (g) => g.invite_code === code.trim().toLowerCase(),
  );

  const run =
    (action: () => Promise<void>, done: () => void) => async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      try {
        await action();
        done();
        groups.reload();
      } catch (err) {
        setError(frenchError(err));
      }
    };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader eyebrow="La famiglia" title="Mes familles">
        Partage tes recettes avec tes proches : crée une famille, puis
        invite-les.
      </PageHeader>

      {groups.loading && !groups.data && <div className="skeleton h-20" />}
      {groups.error && (
        <p className="text-sm font-semibold text-primary" role="alert">
          {groups.error}
        </p>
      )}
      {groups.data?.length === 0 && (
        <div className="card card-menu px-6 py-8 text-center">
          <h2 className="section-title italic">Pas encore de famille</h2>
          <p className="mt-1.5 text-sm text-muted">
            Crée la tienne, ou rejoins celle d’un proche avec son code.
          </p>
        </div>
      )}
      {!!groups.data?.length && (
        <ul className="flex flex-col gap-3">
          {groups.data.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              isOwner={g.owner_id === session?.user.id}
              open={
                openId === undefined
                  ? groups.data!.length === 1
                  : openId === g.id
              }
              onToggle={() =>
                setOpenId(
                  openId === g.id ||
                    (openId === undefined && groups.data!.length === 1)
                    ? null
                    : g.id,
                )
              }
              onChanged={groups.reload}
            />
          ))}
        </ul>
      )}

      {success && (
        <p
          className="text-center text-sm font-semibold text-accent"
          role="status"
        >
          {success}
        </p>
      )}

      <div className="card card-menu flex flex-col gap-5 p-6">
        <form
          className="flex flex-col"
          onSubmit={run(
            () => joinGroup(code),
            () => {
              setCode("");
              setSuccess("Bienvenue dans la famille !");
              if (invited) setParams({}, { replace: true });
            },
          )}
        >
          <label htmlFor="group-code" className="field-label">
            Rejoindre avec un code
          </label>
          <div className="flex gap-2">
            <input
              ref={joinInput}
              id="group-code"
              className={`input ${invited && code ? "border-accent ring-[3px] ring-accent/15" : ""}`}
              placeholder="Ex : 3fa9c21b"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button className="btn h-auto shrink-0 px-5" disabled={!!alreadyIn}>
              Rejoindre
            </button>
          </div>
          {alreadyIn && (
            <p className="mt-2 text-sm text-muted">
              Tu fais déjà partie de « {alreadyIn.name} ».
            </p>
          )}
        </form>
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
          <span className="h-px flex-1 bg-line" />
          ou
          <span className="h-px flex-1 bg-line" />
        </div>
        <form
          className="flex flex-col"
          onSubmit={run(
            () => createGroup(name),
            () => {
              setSuccess(`« ${name.trim()} » est créée. Invite tes proches !`);
              setName("");
            },
          )}
        >
          <label htmlFor="group-name" className="field-label">
            Créer une famille
          </label>
          <div className="flex gap-2">
            <input
              id="group-name"
              className="input"
              placeholder="Ex : Les Rossi"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn-secondary h-auto shrink-0 px-5">
              Créer
            </button>
          </div>
        </form>
        {error && (
          <p className="text-sm font-semibold text-primary" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
