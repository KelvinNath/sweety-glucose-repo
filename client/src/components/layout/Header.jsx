import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function getInitials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  const letters =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : `${parts[0][0]}${parts[parts.length - 1][0]}`;

  return letters.toUpperCase();
}

function Header({ title, navigationOpen, onOpenNavigation, onCloseNavigation }) {
  const { user } = useAuth();
  const name = user?.name?.trim() || "Account";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-violet-100 bg-white px-4 md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        aria-controls="app-sidebar"
        aria-expanded={navigationOpen}
        onClick={onOpenNavigation}
      >
        <Menu />
      </Button>

      <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-violet-950 md:text-lg">
        {title}
      </h1>

      <NavLink
        to="/profile"
        className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-violet-300"
        aria-label="Open profile"
        onClick={onCloseNavigation}
      >
        <span className="hidden max-w-40 truncate text-sm font-medium text-violet-950 sm:inline">
          {name}
        </span>
        <Avatar>
          <AvatarFallback className="bg-violet-700 text-xs font-medium text-white">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
      </NavLink>
    </header>
  );
}

export default Header;
