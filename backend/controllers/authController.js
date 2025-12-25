// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Helper: Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Register User
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user (let model hook hash password)
    const user = await User.create({
      fullName,
      email,
      password, // will be hashed by model hook
      role: role || "user",
    });


    // Send response
    res.status(201).json({
      token: generateToken(user.id),
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login User
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found with this email" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    await user.update({ password: hashedPassword });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // support either 'role' (client requested) or 'requireRole' (middleware enforced)
    const role = req.body.role || req.body.requireRole;
    if (!email || !password) {
      console.error("Login error: Missing email or password", req.body);
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error(`Login error: User not found for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials (user not found)" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error(`Login error: Incorrect password for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials (wrong password)" });
    }

    // If the client requested a role, ensure the stored user has that role
    if (role && user.role !== role) {
      console.error(`Login error: Role mismatch for email: ${email}. requested: ${role}, actual: ${user.role}`);
      return res.status(403).json({ message: "Role mismatch" });
    }

    // Send response
    res.json({
      token: generateToken(user.id),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error: Exception", err);
    res.status(500).json({ message: err.message });
  }
};
