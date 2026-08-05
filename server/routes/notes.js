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
      userId: req.user.userId,      // the owner = whoever is logged in
    },
  });
  res.status(201).json(note);
});

// GET /api/notes — list ONLY the current user's notes
router.get("/", async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.user.userId },        // only THIS user's notes
    orderBy: { updatedAt: "desc" },            // newest-edited first
  });
  res.json(notes);
});

module.exports = router;