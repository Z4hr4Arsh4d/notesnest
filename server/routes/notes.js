const express = require("express");
const prisma = require("../prisma/client");
const authMiddleware = require("../middleware/auth");
const { z } = require("zod");

// the shape a valid note must have
const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().max(50000, "Content too long").optional(),
  workspaceId: z.number().optional(),
});

const router = express.Router();

// Every route in this file is protected — you must be logged in.
router.use(authMiddleware);

// POST /api/notes — create a note owned by the current user
router.post("/", async (req, res) => {
  const parsed = noteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { title, content, workspaceId } = parsed.data;

  const note = await prisma.note.create({
    data: {
      title,
      content: content || "",
      userId: req.user.userId,
      workspaceId: workspaceId || null,
    },
  });
  res.status(201).json(note);
});

// GET /api/notes — list the current user's notes (optionally filtered by workspace)
router.get("/", async (req, res) => {
  const { workspaceId } = req.query;   // optional ?workspaceId=3
  const notes = await prisma.note.findMany({
    where: {
      userId: req.user.userId,
      ...(workspaceId ? { workspaceId: Number(workspaceId) } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  res.json(notes);
});

// GET /api/notes/:id — read a single note (only if it's yours)
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const note = await prisma.note.findUnique({ where: { id } });

  if (!note || note.userId !== req.user.userId) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json(note);
});

// PUT /api/notes/:id — update a note (only if it's yours)
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, content } = req.body;

  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.userId) {
    return res.status(404).json({ error: "Note not found" });
  }

  const note = await prisma.note.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      content: content ?? existing.content,
    },
  });
  res.json(note);
});

// DELETE /api/notes/:id — delete a note (only if it's yours)
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.userId) {
    return res.status(404).json({ error: "Note not found" });
  }

  await prisma.note.delete({ where: { id } });
  res.json({ ok: true, deleted: id });
});

module.exports = router;