import { Icon } from "../../components/Icons";
import type { Group } from "../groups/api";

type Props = {
  groups: Group[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export default function GroupPicker({
  groups,
  value,
  onChange,
  disabled,
}: Props) {
  if (!groups.length) {
    return (
      <p className="text-sm text-muted">
        Tu n’as pas encore de famille. Crée-en une dans l’onglet{" "}
        <b className="font-semibold text-fg">Familles</b> pour partager tes
        recettes.
      </p>
    );
  }
  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((x) => x !== id) : [...value, id],
    );
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const on = value.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => toggle(g.id)}
              className={`filter ${on ? "is-on" : ""}`}
            >
              {on && <Icon name="check" size={14} />}
              {g.name}
            </button>
          );
        })}
      </div>
      <p className="flex items-center gap-1.5 text-sm text-muted">
        <Icon name={value.length ? "users" : "lock"} size={14} />
        {value.length
          ? `Visible par les membres de ${value.length > 1 ? `${value.length} familles` : "1 famille"}.`
          : "Privée : visible par toi seul."}
      </p>
    </div>
  );
}
