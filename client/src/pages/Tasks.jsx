import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export default function TasksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const { data: tasks, isLoading, isError, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiGet("/api/tasks"),
  });

  const createTask = useMutation({
    mutationFn: (newTask) => apiPost("/api/tasks", newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTitle("");
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...data }) => apiPut(`/api/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id) => apiDelete(`/api/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate({ title });
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Tasks</h1>
        <button onClick={() => navigate("/app")}>← Notes</button>
      </div>

      <form onSubmit={handleCreate} style={{ marginBottom: 24, display: "flex", gap: 8 }}>
        <input
          placeholder="New task…" value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={createTask.isPending}>Add</button>
      </form>

      {isLoading && <p>Loading tasks…</p>}
      {isError && <p style={{ color: "red" }}>Error: {error.message}</p>}
      {tasks && tasks.length === 0 && <p>No tasks yet.</p>}

      {tasks && tasks.map((task) => (
        <div key={task.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 8,
        }}>
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => updateTask.mutate({ id: task.id, done: !task.done })}
          />
          <span style={{
            flex: 1,
            textDecoration: task.done ? "line-through" : "none",
            color: task.done ? "#999" : "#000",
          }}>
            {task.title}
          </span>
          <button onClick={() => deleteTask.mutate(task.id)} style={{ color: "red" }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}