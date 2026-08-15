const express = require("express");
const prisma = require("../prisma/client");
const authMiddleware = require("../middleware/auth");
const { z } = require("zod");

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  status: z.enum(["todo", "doing", "done"]).optional(),
  dueDate: z.string().optional(),           // ISO date string, or omitted
  workspaceId: z.number().optional(),
});

const router = express.Router();
router.use(authMiddleware);

// GET /api/tasks — list tasks (optionally by workspace)
router.get("/", async (req, res) => {
  const { workspaceId } = req.query;
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.userId,
      ...(workspaceId ? { workspaceId: Number(workspaceId) } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(tasks);
});

// POST /api/tasks — create a task
router.post("/", async (req, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { title, status, dueDate, workspaceId } = parsed.data;
  const task = await prisma.task.create({
    data: {
      title,
      status: status || "todo",
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: req.user.userId,
      workspaceId: workspaceId || null,
    },
  });
  res.status(201).json(task);
});

// PUT /api/tasks/:id — update a task (status, done, title, dueDate)
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.userId) {
    return res.status(404).json({ error: "Task not found" });
  }
  const { title, status, done, dueDate } = req.body;
  const task = await prisma.task.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      status: status ?? existing.status,
      done: done ?? existing.done,
      dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
    },
  });
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.userId) {
    return res.status(404).json({ error: "Task not found" });
  }
  await prisma.task.delete({ where: { id } });
  res.json({ ok: true, deleted: id });
});

module.exports = router;