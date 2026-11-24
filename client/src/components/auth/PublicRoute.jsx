import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center" role="status">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
}

export default PublicRoute;
