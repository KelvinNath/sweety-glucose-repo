import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import { navigation } from "./navigation";
import Sidebar from "./Sidebar";

function AppLayout() {
  const { pathname } = useLocation();
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    if (!navigationOpen) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setNavigationOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigationOpen]);

  return (
    <div className="app-shell">
      <Sidebar open={navigationOpen} onClose={() => setNavigationOpen(false)} />
      <div className="app-main">
        <Header
          navigationOpen={navigationOpen}
          onOpenNavigation={() => setNavigationOpen(true)}
        />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Primary mobile">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.path} to={item.path} className={pathname === item.path ? "active" : undefined}>
              <Icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default AppLayout;
