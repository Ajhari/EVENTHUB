import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
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

    fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
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
      .then((user) => {
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
    <section>
      <h1>Login</h1>
      <p>Login as customer or vendor.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loggingIn}>
          {loggingIn ? "Logging in..." : "Login"}
        </button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </section>
  );
}

export default Login;
