import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!email.includes("@")) {
      setErrorMessage("Email must contain @.");
      return;
    }

    setLoggingIn(true);

    fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to login");
        }

        return data;
      })
      .then((data) => {
        const { user } = data;

        localStorage.setItem("eventhubUser", JSON.stringify(user));
        window.dispatchEvent(new Event("eventhub-auth-change"));
        setSuccessMessage(`Welcome ${user.name}. Role: ${user.role}`);
        setEmail("");
        setPassword("");
        setLoggingIn(false);

        if (user.role === "vendor") {
          navigate("/vendor/dashboard");
        } else {
          navigate("/vendors");
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        setErrorMessage(error.message);
        setLoggingIn(false);
      });
  }

  return (
    <section className="login-page">
      <div className="login-visual">
        <img src="/images/eventhub-hero.png" alt="An elegant outdoor celebration prepared by event professionals" width="1536" height="1024" />
        <span className="login-visual-shade" aria-hidden="true" />
        <div className="login-visual-copy">
          <span className="login-trust-pill">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 12 2.5 2.5L16 9M12 3l7 3v5c0 4.8-2.9 8.2-7 10-4.1-1.8-7-5.2-7-10V6l7-3Z" /></svg>
            Trusted event marketplace
          </span>
          <blockquote>“Plan every memorable moment with the right people by your side.”</blockquote>
          <p>Discover professionals across Tamil Nadu.</p>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-panel-inner">
          <Link className="login-back-link" to="/vendors"><span aria-hidden="true">←</span> Back to vendors</Link>
          <span className="section-eyebrow">Welcome back</span>
          <h1>Sign in to EventHub</h1>
          <p className="login-intro">Access your inquiries, bookings, and vendor workspace.</p>

          {errorMessage && <p className="login-alert" role="alert"><span aria-hidden="true">!</span>{errorMessage}</p>}
          {successMessage && <p className="success-message" aria-live="polite">{successMessage}</p>}

          <form className="auth-form login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>
            <div className="login-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></svg>
              <input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div className="login-label-row"><label htmlFor="login-password">Password</label></div>
            <div className="login-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5z" /></svg>
              <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
              </button>
            </div>

            <button className="login-submit" type="submit" disabled={loggingIn}>
              <span>{loggingIn ? "Signing in..." : "Sign in"}</span>
              {!loggingIn && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="login-register">New to EventHub? <Link to="/register">Create an account</Link></p>
          <p className="login-role-note"><span aria-hidden="true" /> One sign-in for customers and vendors</p>
        </div>
      </div>
    </section>
  );
}

export default Login;
