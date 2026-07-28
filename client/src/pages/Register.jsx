import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password should be at least 6 characters.");
      return;
    }

    if (!email.includes("@")) {
      setErrorMessage("Email must contain @.");
      return;
    }

    setCreating(true);

    fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to register");
        }

        return data;
      })
      .then(() => {
        setSuccessMessage("Account created successfully.");
        setName("");
        setEmail("");
        setPassword("");
        setRole("customer");
        setCreating(false);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error registering:", error);
        setErrorMessage(error.message);
        setCreating(false);
      });
  }

  return (
    <section>
      <h1>Register</h1>
      <p>Create customer or vendor account.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>
        </label>

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Account"}
        </button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </section>
  );
}

export default Register;
