const express = require("express");
const prisma = require("../prisma/client");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Every route in this file is protected — you must be logged in.
router.use(authMiddleware);

// POST /api/notes — create a note owned by the current user
router.post("/", async (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const note = await prisma.note.create({
    data: {
      title,
      content: content || "",
      userId: req.user.userId,
    },
  });
  res.status(201).json(note);
});

// GET /api/notes — list ONLY the current user's notes
router.get("/", async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.user.userId },
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