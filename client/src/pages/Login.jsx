import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();            // stop the browser's default form reload
    setError("");
    try {
      const data = await apiPost("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);   // remember the token
      navigate("/app");                             // go to the app
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <button type="submit" style={{ width: "100%", padding: 8 }}>Sign in</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}