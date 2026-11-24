import { cn } from "../ui";

/** Ombres sur les bords et lumière en haut de chaque battant. */
const LEAF_SHADE =
  "[--planks-shade:linear-gradient(90deg,rgb(0_0_0/0.2),transparent_16%,transparent_84%,rgb(0_0_0/0.16)),linear-gradient(rgb(255_255_255/0.08),transparent_30%,rgb(0_0_0/0.15))]";

/** Grande porte double. `open` déclenche l'ouverture (transitions CSS). */
export default function Doors({ open }: { open: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-40 overflow-hidden perspective-[1600px] transition-transform delay-100 duration-[1.8s] ease-zoom",
        "motion-reduce:transition-opacity motion-reduce:delay-0 motion-reduce:duration-300",
        open && "scale-[2.8] motion-reduce:scale-100 motion-reduce:opacity-0",
      )}
    >
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={cn(
            "absolute inset-y-0 flex w-1/2 flex-col justify-evenly bg-planks px-5 py-8 backface-hidden will-change-transform [--planks-alpha:0.04]",
            "transition-[transform,filter] delay-150 duration-[1.2s] ease-door motion-reduce:transition-none",
            LEAF_SHADE,
            side === "left"
              ? "left-0 origin-left border-r-2 border-black/40"
              : "right-0 origin-right",
            open && (side === "left" ? "rotate-y-82" : "rotate-y-[-82deg]"),
            open && "brightness-50",
          )}
        >
          <span className="relative my-4 flex-1 rounded-[0.6rem] bg-black/6 shadow-door-panel" />
          <span className="relative my-4 flex-1 rounded-[0.6rem] bg-black/6 shadow-door-panel" />
          <span
            className={cn(
              "absolute bottom-18 size-[1.6rem] rounded-full bg-radial-[circle_at_35%_30%] from-brass-light via-brass via-55% to-brass-700 shadow-knob",
              side === "left" ? "right-4" : "left-4",
            )}
          />
        </div>
      ))}
    </div>
  );
}
