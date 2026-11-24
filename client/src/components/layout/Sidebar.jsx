import { LogOut, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";
import { navigation } from "./navigation";

function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <button
        type="button"
        className={open ? "sidebar-backdrop show" : "sidebar-backdrop"}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside id="app-sidebar" aria-label="Primary" className={open ? "sidebar open" : "sidebar"}>
        <div className="side-logo">
          <Logo light />
          <button type="button" className="side-close" aria-label="Close navigation" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.path} to={item.path} onClick={onClose}>
                <Icon size={18} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
        <button type="button" className="side-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
