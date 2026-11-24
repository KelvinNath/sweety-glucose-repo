function Logo({ light = false }) {
  return (
    <div className={light ? "logo logo-light" : "logo"}>
      <span className="logo-mark">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 27S6.5 21.6 6.5 13.5A5.6 5.6 0 0 1 16 9.4a5.6 5.6 0 0 1 9.5 4.1C25.5 21.6 16 27 16 27Z" />
          <path d="M16 5v11M10.5 10.5h11" />
        </svg>
      </span>
      <span>Sweety</span>
    </div>
  );
}

export default Logo;
