import { useState } from "react";
import { Droplets, Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function getDestination(from) {
  const pathname = from?.pathname;

  if (
    typeof pathname !== "string" ||
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return "/dashboard";
  }

  const search = typeof from.search === "string" ? from.search : "";
  const hash = typeof from.hash === "string" ? from.hash : "";

  return `${pathname}${search}${hash}`;
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(getDestination(location.state?.from), { replace: true });
    } catch (err) {
      if (err?.status === 401) {
        setError("The email or password is incorrect.");
      } else {
        setError("We couldn't sign you in. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-violet-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-violet-700 text-white">
            <Droplets className="size-6" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold tracking-wide text-violet-700">Sweety</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-violet-950">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sign in to continue tracking your glucose.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-violet-950">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 w-full rounded-lg border border-violet-100 bg-white px-3 text-sm text-violet-950 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-violet-400 focus-visible:ring-3 focus-visible:ring-violet-200"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-violet-950">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 w-full rounded-lg border border-violet-100 bg-white px-3 pr-11 text-sm text-violet-950 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-violet-400 focus-visible:ring-3 focus-visible:ring-violet-200"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-10 w-full bg-violet-700 text-white hover:bg-violet-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-violet-700 hover:text-violet-800">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
