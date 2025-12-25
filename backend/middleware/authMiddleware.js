// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const raw = req.header("Authorization");
    console.log("Auth header:", raw); // debug - remove later

    if (!raw || !raw.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const token = raw.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // debug - remove later

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export default auth;
