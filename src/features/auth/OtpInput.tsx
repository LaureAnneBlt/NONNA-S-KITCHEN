import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
};

export default function OtpInput({ value, onChange, length = 6 }: Props) {
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, length - 1);
  const half = Math.ceil(length / 2);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.length === length) input.current?.form?.requestSubmit();
  }, [value, length]);

  const cell = (i: number) => (
    <span
      key={i}
      className={`grid h-12 w-9 place-items-center rounded-xl border bg-surface font-display text-2xl font-semibold text-primary shadow-[inset_0_2px_3px_rgb(43_29_20/0.06)] transition ${
        focused && i === active
          ? "border-primary ring-[3px] ring-primary/15"
          : "border-line-strong"
      }`}
    >
      {value[i] ?? ""}
    </span>
  );

  return (
    <div className="relative mx-auto w-fit">
      <div className="flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: half }, (_, i) => cell(i))}
        <span className="mx-1 h-0.5 w-2 rounded-full bg-brass" />
        {Array.from({ length: length - half }, (_, i) => cell(half + i))}
      </div>
      <input
        ref={input}
        className="absolute inset-0 h-full w-full cursor-text text-base opacity-0"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label={`Code à ${length} chiffres reçu par email`}
        required
        minLength={length}
        maxLength={length}
        autoFocus
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const code = e.target.value.replace(/\D/g, "").slice(0, length);
          onChange(code);
        }}
      />
    </div>
  );
}
