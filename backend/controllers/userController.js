// controllers/userController.js
import User from "../models/User.js";

// ✅ Get User by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// ✅ Update User Profile
export const updateUser = async (req, res) => {
  try {
    const { fullName, email, avatar } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update only if data exists
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};
