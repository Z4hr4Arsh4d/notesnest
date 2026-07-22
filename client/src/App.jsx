import { useState } from "react";

function App() {
  const [status, setStatus] = useState(null);

  async function checkServer() {
    try {
      const res = await fetch("http://localhost:5000/api/health");
      const data = await res.json();
      setStatus(data.message);
    } catch (err) {
      setStatus("Could not reach the server 😕");
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>NotesNest</h1>
      <button onClick={checkServer}>Check server</button>
      {status && <p>Server says: {status}</p>}
    </div>
  );
}

export default App;