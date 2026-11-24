import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/readings": "Reading history",
  "/reports": "Reports",
  "/profile": "My profile",
};

function Header({ navigationOpen, onOpenNavigation }) {
  const { pathname } = useLocation();

  return (
    <header className="topbar">
      <button
        type="button"
        className="menu-btn"
        aria-label="Open navigation"
        aria-controls="app-sidebar"
        aria-expanded={navigationOpen}
        onClick={onOpenNavigation}
      >
        <Menu size={20} />
      </button>
      <span className="mobile-page-title">{PAGE_TITLES[pathname] ?? "Sweety"}</span>
    </header>
  );
}

export default Header;
