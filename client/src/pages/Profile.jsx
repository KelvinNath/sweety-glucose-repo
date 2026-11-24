import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/display";

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
    return <p className="status-line" role="status">Loading account...</p>;
  }

  if (!user) {
    return <p className="status-line">Account details are unavailable.</p>;
  }

  const name = displayValue(user.name);
  const email = displayValue(user.email);

  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">Account</span>
          <h1>My profile</h1>
          <p>View your Sweety account information.</p>
        </div>
      </div>
      <section className="profile-card panel" aria-labelledby="account-information-heading">
        <div className="profile-cover" />
        <div className="profile-head">
          <div className="profile-avatar">{getInitials(user.name)}</div>
        </div>
        <div className="profile-identity">
          <h2 id="account-information-heading">{name}</h2>
          <p>{email}</p>
        </div>
        <dl className="profile-info">
          <div>
            <dt>Full name</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt>Email address</dt>
            <dd>{email}</dd>
          </div>
        </dl>
        <div className="profile-footer">
          <p>Sign out of this account on this device.</p>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </section>
    </>
  );
}

export default Profile;
