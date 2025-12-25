import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";

// Models (ensure these are imported so we can declare associations before sync)
import User from "./models/User.js";
import Expense from "./models/Expense.js";
import Income from "./models/Income.js";

// ✅ Routes
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboard.js"; // <-- Added
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

// ✅ Connect & Sync Database
try {
  await sequelize.authenticate();
  console.log("✅ Database connected successfully.");
  // Declare model associations before syncing so Sequelize can create proper foreign keys if needed
  try {
    User.hasMany(Expense, { foreignKey: "userId" });
    Expense.belongsTo(User, { foreignKey: "userId" });

    User.hasMany(Income, { foreignKey: "userId" });
    Income.belongsTo(User, { foreignKey: "userId" });
  } catch (assocErr) {
    console.warn("Warning: could not declare associations:", assocErr.message || assocErr);
  }

  await sequelize.sync(); // syncs ALL models
  console.log("✅ Models synchronized.");

  // Ensure `role` column exists on users table (development-time safety)
  try {
    const dbName = process.env.MYSQL_DATABASE;
    // Check if column exists
    const [rows] = await sequelize.query(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
      { replacements: { db: dbName } }
    );
    const count = rows && rows[0] && (rows[0].cnt || rows[0].COUNT || rows[0].count);
    if (!count || Number(count) === 0) {
      console.log("Role column missing, attempting to add 'role' column to users table...");
      await sequelize.query("ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user'");
      console.log("✅ Added 'role' column to users table.");
    }
      // Ensure lastLoginAt exists as well (some deployments may not have this column)
      try {
        const [lastLoginRows] = await sequelize.query(
          `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'lastLoginAt'`,
          { replacements: { db: dbName } }
        );
        const lastLoginCount = lastLoginRows && lastLoginRows[0] && (lastLoginRows[0].cnt || lastLoginRows[0].COUNT || lastLoginRows[0].count);
        if (!lastLoginCount || Number(lastLoginCount) === 0) {
          console.log("'lastLoginAt' column missing, attempting to add it to users table...");
          await sequelize.query("ALTER TABLE users ADD COLUMN lastLoginAt DATETIME NULL");
          console.log("✅ Added 'lastLoginAt' column to users table.");
        }
      } catch (colErr) {
        console.warn("Could not ensure 'lastLoginAt' column exists automatically:", colErr.message || colErr);
      }
  } catch (err) {
    console.warn("Could not ensure 'role' column exists automatically:", err.message || err);
  }
} catch (err) {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
}

const app = express();

// ✅ Middlewares

app.use(cors());
// Increase payload size limit to 10mb
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes); // <-- Added
app.use("/api/admin", adminRoutes);

// ✅ Test Route
app.get("/", (req, res) => res.send("Expense Tracker API"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
