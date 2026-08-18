import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

const COLUMNS = [
  { key: "todo",  label: "To Do",  color: "#e3f2fd" },
  { key: "doing", label: "Doing",  color: "#fff8e1" },
  { key: "done",  label: "Done",   color: "#e8f5e9" },
];

export default function TasksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [dragOverCol, setDragOverCol] = useState(null);   // which column is being hovered

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
    createTask.mutate({ title, status: "todo" });
  }

  // --- Drag and drop handlers ---
  function handleDragStart(e, taskId) {
    e.dataTransfer.setData("taskId", taskId);   // remember which task is being dragged
  }

  function handleDrop(e, newStatus) {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData("taskId"));
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTask.mutate({ id: taskId, status: newStatus });
    }
    setDragOverCol(null);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Task Board</h1>
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

      {tasks && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => (t.status || "todo") === col.key);
            const isOver = dragOverCol === col.key;
            return (
              <div
                key={col.key}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col.key)}
                style={{
                  flex: 1, background: col.color, borderRadius: 10, padding: 12, minHeight: 300,
                  outline: isOver ? "3px dashed #4a90d9" : "3px solid transparent",  // highlight drop target
                  transition: "outline 0.1s",
                }}
              >
                <h3 style={{ marginTop: 0, textAlign: "center" }}>
                  {col.label} <span style={{ color: "#888" }}>({columnTasks.length})</span>
                </h3>

                {columnTasks.length === 0 && (
                  <p style={{ textAlign: "center", color: "#aaa", fontSize: 14 }}>Drop here</p>
                )}

                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    style={{
                      background: "#fff", borderRadius: 8, padding: 10, marginBottom: 8,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)", cursor: "grab",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{task.title}</span>
                      <button
                        onClick={() => deleteTask.mutate(task.id)}
                        style={{ fontSize: 12, padding: "2px 6px", color: "red" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}