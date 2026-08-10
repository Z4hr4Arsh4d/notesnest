import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../api";

export default function AppPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // create form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // edit state — which note is being edited, and its draft values
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // READ: fetch the notes
  const { data: notes, isLoading, isError, error } = useQuery({
    queryKey: ["notes"],
    queryFn: () => apiGet("/api/notes"),
  });

  // CREATE
  const createNote = useMutation({
    mutationFn: (newNote) => apiPost("/api/notes", newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setTitle("");
      setContent("");
    },
  });

  // UPDATE
  const updateNote = useMutation({
    mutationFn: ({ id, ...data }) => apiPut(`/api/notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditingId(null);
    },
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    createNote.mutate({ title, content });
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  function saveEdit(id) {
    updateNote.mutate({ id, title: editTitle, content: editContent });
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
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <textarea
          placeholder="Write something…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <button type="submit" disabled={createNote.isPending}>
          {createNote.isPending ? "Adding…" : "Add note"}
        </button>
      </form>

      {/* the three states */}
      {isLoading && <p>Loading your notes…</p>}
      {isError && <p style={{ color: "red" }}>Error: {error.message}</p>}
      {notes && notes.length === 0 && <p>No notes yet. Create your first one!</p>}

      {/* the notes */}
      {notes && notes.map((note) => (
        <div
          key={note.id}
          style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 10 }}
        >
          {editingId === note.id ? (
            // EDIT MODE
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{ display: "block", width: "100%", marginBottom: 6, padding: 6 }}
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                style={{ display: "block", width: "100%", marginBottom: 6, padding: 6 }}
              />
              <button onClick={() => saveEdit(note.id)} disabled={updateNote.isPending}>
                Save
              </button>
              <button onClick={() => setEditingId(null)} style={{ marginLeft: 6 }}>
                Cancel
              </button>
            </>
          ) : (
            // VIEW MODE
            <>
              <h3 style={{ margin: "0 0 6px" }}>{note.title}</h3>
              <p style={{ margin: "0 0 8px", color: "#555" }}>{note.content}</p>
              <button onClick={() => startEdit(note)}>Edit</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}