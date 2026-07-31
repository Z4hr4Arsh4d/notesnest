const jwt = require("jsonwebtoken");
require("dotenv").config();

// The wall: only requests with a valid token get past this.
function authMiddleware(req, res, next) {
  // the token arrives in a header like:  Authorization: Bearer eyJhbGci...
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please sign in" });
  }

  const token = header.split(" ")[1];   // grab the part after "Bearer "

  try {
    // verify the signature and decode the payload. Throws if invalid/expired.
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;                  // attach the user info to the request
    next();                              // wave it through to the actual route
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

module.exports = authMiddleware;