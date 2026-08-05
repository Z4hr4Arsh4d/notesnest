const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");   
const noteRoutes = require("./routes/notes");
const app = express();   
const rateLimit = require("express-rate-limit");

// Allow at most 20 auth attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,
  message: { error: "Too many attempts, please try again later" },
});  
                    
app.use(cors());
app.use(express.json());
app.use("/api/auth", authLimiter);  // Apply rate limiting to auth routes
app.use("/api/notes", noteRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "server is alive" });
});

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);                    

app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ error: "Something went wrong on our end" });
});
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});