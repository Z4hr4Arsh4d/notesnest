const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");

const router = express.Router();

// POST /api/auth/register — create a new account
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  // basic validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  // is the email already taken?
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "That email is already registered" });
  }

  // hash the password — 10 is the "cost factor" (how slow/strong the hash is)
  const passwordHash = await bcrypt.hash(password, 10);

  // create the user
  const user = await prisma.user.create({
    data: { email, name: name || null, passwordHash },
  });

  // never send the hash back to the client
  res.status(201).json({ id: user.id, email: user.email, name: user.name });
});

module.exports = router;