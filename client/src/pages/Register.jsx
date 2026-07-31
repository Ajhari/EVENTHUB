import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Use at least 6 characters for your password.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setCreating(true);
    fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to register");
        return data;
      })
      .then((data) => {
        const { user } = data;

        localStorage.setItem("eventhubUser", JSON.stringify(user));
        window.dispatchEvent(new Event("eventhub-auth-change"));
        setSuccessMessage("Account created successfully.");
        setName("");
        setEmail("");
        setPassword("");
        setRole("customer");
        setCreating(false);

        if (user.role === "vendor") {
          navigate("/vendor/dashboard");
        } else {
          navigate("/vendors");
        }
      })
      .catch((error) => {
        console.error("Error registering:", error);
        setErrorMessage(error.message);
        setCreating(false);
      });
  }

  return (
    <section className="login-page register-page">
      <div className="login-visual register-visual">
        <img src="/images/vendor-wedding.png" alt="A thoughtfully styled wedding celebration by event professionals" width="1536" height="1024" />
        <span className="login-visual-shade" aria-hidden="true" />
        <div className="login-visual-copy">
          <span className="login-trust-pill">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 12.5 10.5 15 16 9.5M12 3l7 3v5c0 4.8-2.9 8.2-7 10-4.1-1.8-7-5.2-7-10V6l7-3Z" /></svg>
            Built for every celebration
          </span>
          <blockquote>“Great events begin with one simple connection.”</blockquote>
          <p>Join customers and trusted professionals across Tamil Nadu.</p>
        </div>
      </div>

      <div className="login-panel register-panel">
        <div className="login-panel-inner">
          <Link className="login-back-link" to="/"><span aria-hidden="true">←</span> Back to home</Link>
          <span className="section-eyebrow">Join EventHub</span>
          <h1>Create your account</h1>
          <p className="login-intro">Plan an event or grow your business—all from one place.</p>

          {errorMessage && <p className="login-alert" role="alert"><span aria-hidden="true">!</span>{errorMessage}</p>}
          {successMessage && <p className="success-message" aria-live="polite">{successMessage}</p>}

          <form className="auth-form login-form register-form" onSubmit={handleSubmit}>
            <fieldset className="register-role-fieldset">
              <legend>I want to</legend>
              <div className="register-role-options">
                <label className={role === "customer" ? "is-selected" : ""}>
                  <input type="radio" name="role" value="customer" checked={role === "customer"} onChange={(event) => setRole(event.target.value)} />
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 8h4M19 6v4" /></svg>
                  <span><strong>Plan an event</strong><small>Find and contact vendors</small></span>
                </label>
                <label className={role === "vendor" ? "is-selected" : ""}>
                  <input type="radio" name="role" value="vendor" checked={role === "vendor"} onChange={(event) => setRole(event.target.value)} />
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V8l8-5 8 5v13M8 21v-7h8v7M8 10h.01M16 10h.01" /></svg>
                  <span><strong>Offer services</strong><small>Showcase your business</small></span>
                </label>
              </div>
            </fieldset>

            <label htmlFor="register-name">Full name</label>
            <div className="login-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /></svg>
              <input id="register-name" type="text" autoComplete="name" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>

            <label htmlFor="register-email">Email address</label>
            <div className="login-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></svg>
              <input id="register-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <label htmlFor="register-password">Create password</label>
            <div className="login-input-wrap register-password-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5z" /></svg>
              <input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 6 characters" minLength="6" aria-describedby="password-help" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
              </button>
            </div>
            <p id="password-help" className={password.length >= 6 ? "register-password-help is-valid" : "register-password-help"}><span aria-hidden="true">✓</span> 6 characters minimum</p>

            <button className="login-submit" type="submit" disabled={creating}>
              <span>{creating ? "Creating account..." : `Create ${role} account`}</span>
              {!creating && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="login-register">Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="register-terms">By creating an account, you agree to use EventHub responsibly.</p>
        </div>
      </div>
    </section>
  );
}

export default Register;
