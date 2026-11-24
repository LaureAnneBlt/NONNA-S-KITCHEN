import { cn } from "./cn";
import { Plate } from "./Decor";
import Tomato from "./Tomato";

export function Photo({
  src,
  alt = "",
  lazy,
  className,
}: {
  src?: string | null;
  alt?: string;
  lazy?: boolean;
  className?: string;
}) {
  const frame = "w-full rounded-[0.7rem] ring-1 ring-brass/40";
  if (!src)
    return (
      <div
        className={cn(frame, "grid place-items-center bg-gingham", className)}
      >
        <Plate>
          <Tomato size={40} />
        </Plate>
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? "lazy" : undefined}
      className={cn(frame, "object-cover", className)}
    />
  );
}
