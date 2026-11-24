import { useNavigate } from "react-router-dom";
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

function displayValue(value) {
  const text = String(value ?? "").trim();

  return text || "—";
}

function Profile() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-violet-950">Profile</h2>
        <p className="text-sm text-muted-foreground" role="status">
          Loading account...
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-violet-950">Profile</h2>
        <p className="text-sm text-muted-foreground">Account details are unavailable.</p>
      </section>
    );
  }

  const name = displayValue(user.name);
  const email = displayValue(user.email);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-violet-950">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View your account details.
        </p>
      </div>

      <section
        aria-labelledby="account-information-heading"
        className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6"
      >
        <h3
          id="account-information-heading"
          className="text-lg font-semibold text-violet-950"
        >
          Account Information
        </h3>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-16">
            <AvatarFallback className="bg-violet-700 text-lg font-medium text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-violet-950">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-violet-50 px-4 py-3">
            <dt className="text-sm text-muted-foreground">Full name</dt>
            <dd className="mt-1 text-sm font-medium break-words text-violet-950">{name}</dd>
          </div>
          <div className="rounded-xl bg-violet-50 px-4 py-3">
            <dt className="text-sm text-muted-foreground">Email address</dt>
            <dd className="mt-1 text-sm font-medium break-words text-violet-950">{email}</dd>
          </div>
        </dl>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-6"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </section>
    </section>
  );
}

export default Profile;
