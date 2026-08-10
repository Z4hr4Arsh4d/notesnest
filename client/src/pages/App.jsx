import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export default function AppPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [activeWs, setActiveWs] = useState(null);
  const [wsName, setWsName] = useState("");

  // workspaces
  const { data: workspaces } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => apiGet("/api/workspaces"),
  });

  // notes (refetches when the active workspace changes)
  const { data: notes, isLoading, isError, error } = useQuery({
    queryKey: ["notes", activeWs],
    queryFn: () =>
      apiGet(activeWs ? `/api/notes?workspaceId=${activeWs}` : "/api/notes"),
  });

  const createWorkspace = useMutation({
    mutationFn: (name) => apiPost("/api/workspaces", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setWsName("");
    },
  });

  const createNote = useMutation({
    mutationFn: (newNote) => apiPost("/api/notes", newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setTitle("");
      setContent("");
    },
  });

  const updateNote = useMutation({
    mutationFn: ({ id, ...data }) => apiPut(`/api/notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditingId(null);
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id) => apiDelete(`/api/notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    createNote.mutate({ title, content, ...(activeWs ? { workspaceId: activeWs } : {}) });
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

  // group notes into a tree
  const topLevel = (notes || []).filter((n) => !n.parentId);
  const childrenOf = (id) => (notes || []).filter((n) => n.parentId === id);

  // recursively render a note and its children, indented by depth
  function renderNote(note, depth = 0) {
    return (
      <div key={note.id} style={{ marginLeft: depth * 24 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 10 }}>
          {editingId === note.id ? (
            <>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                style={{ display: "block", width: "100%", marginBottom: 6, padding: 6 }} />
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3}
                style={{ display: "block", width: "100%", marginBottom: 6, padding: 6 }} />
              <button onClick={() => saveEdit(note.id)} disabled={updateNote.isPending}>Save</button>
              <button onClick={() => setEditingId(null)} style={{ marginLeft: 6 }}>Cancel</button>
            </>
          ) : (
            <>
              <h3 style={{ margin: "0 0 6px" }}>{note.title}</h3>
              <p style={{ margin: "0 0 8px", color: "#555" }}>{note.content}</p>
              <button onClick={() => startEdit(note)}>Edit</button>
              <button onClick={() => { if (confirm("Delete this note?")) deleteNote.mutate(note.id); }}
                style={{ marginLeft: 6, color: "red" }}>Delete</button>
              <button
                onClick={() => {
                  const t = prompt("Child note title:");
                  if (t && t.trim())
                    createNote.mutate({ title: t, parentId: note.id, ...(activeWs ? { workspaceId: activeWs } : {}) });
                }}
                style={{ marginLeft: 6 }}
              >+ Subnote</button>
            </>
          )}
        </div>
        {childrenOf(note.id).map((child) => renderNote(child, depth + 1))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* ---------- SIDEBAR ---------- */}
      <aside style={{ width: 200, borderRight: "1px solid #333", padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Workspaces</h3>

        <div
          onClick={() => setActiveWs(null)}
          style={{
            padding: "6px 8px", borderRadius: 6, cursor: "pointer",
            background: activeWs === null ? "#2a2a2a" : "transparent",
          }}
        >
          All notes
        </div>

        {workspaces && workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => setActiveWs(ws.id)}
            style={{
              padding: "6px 8px", borderRadius: 6, cursor: "pointer",
              background: activeWs === ws.id ? "#2a2a2a" : "transparent",
            }}
          >
            {ws.name}
          </div>
        ))}

        <form
          onSubmit={(e) => { e.preventDefault(); if (wsName.trim()) createWorkspace.mutate(wsName); }}
          style={{ marginTop: 12 }}
        >
          <input
            placeholder="New workspace" value={wsName}
            onChange={(e) => setWsName(e.target.value)}
            style={{ width: "100%", padding: 6, marginBottom: 6, boxSizing: "border-box" }}
          />
          <button type="submit" style={{ width: "100%" }}>+ Add</button>
        </form>
      </aside>

      {/* ---------- MAIN ---------- */}
      <main style={{ flex: 1, maxWidth: 640, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>{activeWs ? workspaces?.find((w) => w.id === activeWs)?.name : "All notes"}</h1>
          <button onClick={logout}>Log out</button>
        </div>

        <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
          <input
            placeholder="Note title" value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          />
          <textarea
            placeholder="Write something…" value={content}
            onChange={(e) => setContent(e.target.value)} rows={3}
            style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          />
          <button type="submit" disabled={createNote.isPending}>
            {createNote.isPending ? "Adding…" : "Add note"}
          </button>
        </form>

        {isLoading && <p>Loading your notes…</p>}
        {isError && <p style={{ color: "red" }}>Error: {error.message}</p>}
        {notes && topLevel.length === 0 && <p>No notes here yet.</p>}

        {notes && topLevel.map((note) => renderNote(note))}
      </main>
    </div>
  );
}