import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import { getNavigationItem } from "./navigation";
import Sidebar from "./Sidebar";

function AppLayout() {
  const { pathname } = useLocation();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const currentPage = getNavigationItem(pathname);

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
    <div className="flex min-h-svh bg-violet-50">
      <Sidebar open={navigationOpen} onClose={() => setNavigationOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={currentPage?.title ?? "Sweety"}
          navigationOpen={navigationOpen}
          onOpenNavigation={() => setNavigationOpen(true)}
          onCloseNavigation={() => setNavigationOpen(false)}
        />
        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
