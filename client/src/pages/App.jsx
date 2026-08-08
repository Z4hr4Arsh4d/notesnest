import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api";

export default function AppPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // READ: fetch the notes
  const { data: notes, isLoading, isError, error } = useQuery({
    queryKey: ["notes"],
    queryFn: () => apiGet("/api/notes"),
  });

  // CREATE: a mutation that adds a note, then refreshes the list
  const createNote = useMutation({
    mutationFn: (newNote) => apiPost("/api/notes", newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });  // refetch the list
      setTitle("");
      setContent("");
    },
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    createNote.mutate({ title, content });
  }

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

      {/* create form */}
      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <input
          placeholder="Note title" value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <textarea
          placeholder="Write something…" value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <button type="submit" disabled={createNote.isPending}>
          {createNote.isPending ? "Adding…" : "Add note"}
        </button>
      </form>

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