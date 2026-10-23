import tomato from "../assets/tomato.png";

export default function Tomato({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={tomato}
      width={size}
      height={size}
      alt=""
      className={className}
      draggable={false}
    />
  );
}
