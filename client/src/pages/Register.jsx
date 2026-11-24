import { useState } from "react";
import { Droplets, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const inputClassName =
  "h-10 w-full rounded-lg border border-violet-100 bg-white px-3 text-sm text-violet-950 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-violet-400 focus-visible:ring-3 focus-visible:ring-violet-200";

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

      setFormError(
        "We couldn't create your account. Please check your connection and try again.",
      );
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
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Start tracking your blood glucose levels.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-violet-950">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
              placeholder="Alex Morgan"
            />
            {fieldErrors.name ? (
              <p id="name-error" role="alert" className="text-sm text-destructive">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

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
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
              placeholder="you@example.com"
            />
            {fieldErrors.email ? (
              <p id="email-error" role="alert" className="text-sm text-destructive">
                {fieldErrors.email}
              </p>
            ) : null}
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
                autoComplete="new-password"
                required
                value={password}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby="password-hint"
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClassName} pr-11`}
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
            <p
              id="password-hint"
              role={fieldErrors.password ? "alert" : undefined}
              className={fieldErrors.password ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
            >
              {fieldErrors.password ??
                "At least 8 characters, with one letter and one number."}
            </p>
          </div>

          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-10 w-full bg-violet-700 text-white hover:bg-violet-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-violet-700 hover:text-violet-800">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
