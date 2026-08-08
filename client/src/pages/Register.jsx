import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/api/auth/register", { email, password, name });
      // after registering, log them straight in
      const data = await apiPost("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      navigate("/app");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1>Create account</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }} />
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }} />
        <input type="password" placeholder="Password (8+ chars)" value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }} />
        <button type="submit" style={{ width: "100%", padding: 8 }}>Create account</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Have an account? <Link to="/login">Sign in</Link></p>
    </div>
  );
}