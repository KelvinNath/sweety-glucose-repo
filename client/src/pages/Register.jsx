import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { useAuth } from "@/context/AuthContext";

function fieldErrorsFromResponse(error) {
  const details = error?.data?.errors;
  if (!Array.isArray(details)) {
    return {};
  }

  const errors = {};

  for (const item of details) {
    if (item?.field && item?.message && !errors[item.field]) {
      errors[item.field] = item.message;
    }
  }

  return errors;
}

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const nextFieldErrors = {};

    if (!trimmedName) {
      nextFieldErrors.name = "Name is required.";
    }

    if (!trimmedEmail) {
      nextFieldErrors.email = "Email is required.";
    }

    setName(trimmedName);
    setEmail(trimmedEmail);
    setFieldErrors(nextFieldErrors);
    setFormError("");

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name: trimmedName, email: trimmedEmail, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err?.status === 409) {
        setFormError("An account with this email already exists.");
        return;
      }

      const serverFieldErrors = fieldErrorsFromResponse(err);

      if (err?.status === 400 && Object.keys(serverFieldErrors).length > 0) {
        setFieldErrors(serverFieldErrors);
        return;
      }

      if (err?.status === 400 && err.message && err.message !== "Validation failed") {
        setFormError(err.message);
        return;
      }

      setFormError("We couldn't create your account. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={handleSubmit}>
        <span className="eyebrow">Get started</span>
        <h2>Create your account</h2>
        <p>Start building a clearer view of your daily readings.</p>
        {formError ? <div className="form-alert" role="alert">{formError}</div> : null}
        <label className="field" htmlFor="name">
          <span>Full name</span>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="e.g. Alex Morgan"
            value={name}
            aria-invalid={Boolean(fieldErrors.name)}
            onChange={(event) => setName(event.target.value)}
          />
          {fieldErrors.name ? <small className="field-error">{fieldErrors.name}</small> : null}
        </label>
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
            aria-invalid={Boolean(fieldErrors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
          {fieldErrors.email ? <small className="field-error">{fieldErrors.email}</small> : null}
        </label>
        <label className="field" htmlFor="password">
          <span>Password</span>
          <div className="password-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Enter your password"
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
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
          <small className={fieldErrors.password ? "field-error" : undefined}>
            {fieldErrors.password ?? "At least 8 characters, with one letter and one number."}
          </small>
        </label>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default Register;
