import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";

export default function AppPage() {
  const navigate = useNavigate();

  // useQuery handles loading/error/data for us, and caches the result
  const { data: notes, isLoading, isError, error } = useQuery({
    queryKey: ["notes"],                    // a name for this cached data
    queryFn: () => apiGet("/api/notes"),    // how to fetch it
  });

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Notes</h1>
        <button onClick={logout}>Log out</button>
      </div>

      {isLoading && <p>Loading your notes…</p>}
      {isError && <p style={{ color: "red" }}>Error: {error.message}</p>}
      {notes && notes.length === 0 && <p>No notes yet. Create your first one!</p>}

      {notes && notes.map((note) => (
        <div key={note.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 10 }}>
          <h3 style={{ margin: "0 0 6px" }}>{note.title}</h3>
          <p style={{ margin: 0, color: "#555" }}>{note.content}</p>
        </div>
      ))}
    </div>
  );
}