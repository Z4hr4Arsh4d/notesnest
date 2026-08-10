const express = require("express");
const prisma = require("../prisma/client");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);   // all workspace routes require login

// GET /api/workspaces — list the user's workspaces
router.get("/", async (req, res) => {
  const workspaces = await prisma.workspace.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: "asc" },
  });
  res.json(workspaces);
});

// POST /api/workspaces — create a workspace
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Workspace name is required" });
  }
  const workspace = await prisma.workspace.create({
    data: { name: name.trim(), userId: req.user.userId },
  });
  res.status(201).json(workspace);
});

// DELETE /api/workspaces/:id — delete a workspace (and cascade its notes)
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.workspace.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.userId) {
    return res.status(404).json({ error: "Workspace not found" });
  }
  await prisma.workspace.delete({ where: { id } });
  res.json({ ok: true, deleted: id });
});

module.exports = router;