const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");   

const app = express();                         
app.use(cors());
app.use(express.json());

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