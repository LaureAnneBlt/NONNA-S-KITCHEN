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
import { useConfirm } from "../../components/Confirm";
import {
  Button,
  Card,
  Chip,
  cn,
  Icon,
  Input,
  Label,
  Message,
  PageHeader,
  SectionTitle,
  Skeleton,
  Tag,
  TextButton,
} from "../../ui";

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
    <Button size="sm" className="w-full" onClick={invite}>
      <Icon name={copied ? "check" : "share"} size={17} />
      {copied ? "Invitation copiée" : "Inviter quelqu’un"}
    </Button>
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
    <Chip
      on={copied}
      onClick={copy}
      aria-label={`Copier le code ${code}`}
      className="h-8 px-3 font-semibold tracking-[0.06em] text-fg"
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
    </Chip>
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
    <Card as="li" menu className="animate-pop">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-brass bg-door font-display text-lg font-semibold italic text-on-primary shadow-medallion">
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
        <span className={cn("text-subtle transition", open && "rotate-180")}>
          <Icon name="chevron" size={20} />
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-5 border-t border-dashed border-line-strong px-5 pb-5 pt-4">
          <div>
            <Label as="h3">Membres</Label>
            <ul className="flex flex-wrap gap-1.5">
              {g.members.map((m) => (
                <Tag as="li" key={m.user_id} muted className="text-sm">
                  {m.display_name}
                </Tag>
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
              <Label htmlFor={`rename-${g.id}`} className="mb-0">
                Nouveau nom
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`rename-${g.id}`}
                  required
                  maxLength={60}
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button size="stretch">OK</Button>
              </div>
              <TextButton
                className="self-start text-sm text-muted"
                onClick={() => {
                  setRenaming(false);
                  setName(g.name);
                }}
              >
                Annuler
              </TextButton>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {isOwner && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRenaming(true)}
                >
                  <Icon name="edit" size={15} />
                  Renommer
                </Button>
              )}
              <Button variant="danger" onClick={leave}>
                <Icon name="logout" size={16} />
                Quitter la famille
              </Button>
            </div>
          )}
          {error && <Message>{error}</Message>}
        </div>
      )}
      {dialog}
    </Card>
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

      {groups.loading && !groups.data && <Skeleton className="h-20" />}
      {groups.error && <Message>{groups.error}</Message>}
      {groups.data?.length === 0 && (
        <Card menu className="px-6 py-8 text-center">
          <SectionTitle className="italic">Pas encore de famille</SectionTitle>
          <p className="mt-1.5 text-sm text-muted">
            Crée la tienne, ou rejoins celle d’un proche avec son code.
          </p>
        </Card>
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
        <Message tone="success" className="text-center">
          {success}
        </Message>
      )}

      <Card menu className="flex flex-col gap-5 p-6">
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
          <Label htmlFor="group-code">Rejoindre avec un code</Label>
          <div className="flex gap-2">
            <Input
              ref={joinInput}
              id="group-code"
              className={cn(
                invited && code && "border-accent ring-[3px] ring-accent/15",
              )}
              placeholder="Ex : 3fa9c21b"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button size="stretch" disabled={!!alreadyIn}>
              Rejoindre
            </Button>
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
          <Label htmlFor="group-name">Créer une famille</Label>
          <div className="flex gap-2">
            <Input
              id="group-name"
              placeholder="Ex : Les Rossi"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button variant="secondary" size="stretch">
              Créer
            </Button>
          </div>
        </form>
        {error && <Message>{error}</Message>}
      </Card>
    </section>
  );
}
