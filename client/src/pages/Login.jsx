import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
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
    <AuthShell>
      <form className="auth-form" onSubmit={handleSubmit}>
        <span className="eyebrow">Welcome back</span>
        <h2>Sign in to Sweety</h2>
        <p>Sign in to continue tracking your glucose.</p>
        {error ? <div className="form-alert" role="alert">{error}</div> : null}
        <label className="field" htmlFor="email">
          <span>Email address</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field" htmlFor="password">
          <span>Password</span>
          <div className="password-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </label>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <p className="auth-switch">
          New to Sweety? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default Login;
