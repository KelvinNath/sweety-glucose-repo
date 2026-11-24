import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { navigation } from "./navigation";

function Sidebar({ open, onClose }) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-violet-950/40 md:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      ) : null}

      <aside
        id="app-sidebar"
        aria-label="Primary"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-violet-100 bg-white md:static md:flex",
          open ? "flex" : "hidden",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <span className="flex size-9 items-center justify-center rounded-xl bg-violet-700 text-sm font-semibold text-white">
            S
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-violet-950">
              Sweety
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Glucose tracker
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <Separator />

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-violet-100 text-violet-800"
                      : "text-violet-950/75 hover:bg-violet-50 hover:text-violet-900",
                  )
                }
              >
                <Icon className="size-4" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
