import { BookOpen, Users, LogOut } from "lucide-react";

export type IconName = "book" | "users" | "logout";

type IconProps = {
  name: IconName;
};

export function Icon({ name }: IconProps) {
  const icons = {
    book: BookOpen,
    users: Users,
    logout: LogOut,
  };

  const IconComponent = icons[name];

  return <IconComponent size={22} strokeWidth={2} aria-hidden="true" />;
}
