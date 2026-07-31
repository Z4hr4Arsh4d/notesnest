const express = require("express");
const prisma = require("../prisma/client");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /api/me — returns the currently logged-in user.
// authMiddleware runs FIRST; if the token is bad, the handler never runs.
router.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },       // req.user came from the middleware
    select: { id: true, email: true, name: true, createdAt: true },  // never the hash
  });
  res.json(user);
});

module.exports = router;