import Logo from "@/components/brand/Logo";

function AuthShell({ children }) {
  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="auth-brand-inner">
          <Logo light />
          <div className="brand-copy">
            <span className="eyebrow">Daily clarity, made simple</span>
            <h1>
              Your glucose journey,
              <br />
              all in one place.
            </h1>
            <p>
              Record daily readings and understand your patterns with a calm, private workspace designed around you.
            </p>
          </div>
          <div className="brand-preview">
            <div>
              <span>Today’s average</span>
              <strong>
                126 <small>mg/dL</small>
              </strong>
            </div>
            <svg viewBox="0 0 340 90" preserveAspectRatio="none" aria-hidden="true">
              <path className="preview-fill" d="M0 72 C45 50,63 62,96 40 S158 63,195 34 S260 50,340 14 L340 90 L0 90Z" />
              <path d="M0 72 C45 50,63 62,96 40 S158 63,195 34 S260 50,340 14" />
            </svg>
          </div>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-mobile-logo">
          <Logo />
        </div>
        {children}
      </section>
    </main>
  );
}

export default AuthShell;
