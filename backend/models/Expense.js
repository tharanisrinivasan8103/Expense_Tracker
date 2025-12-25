// ✅ backend/models/Expense.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Expense = sequelize.define("Expense", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  category: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW, // fallback to today if frontend doesn't send date
  },
  userId: { type: DataTypes.INTEGER, allowNull: true }, // links expense to a user
}, {
  tableName: "expenses", // ✅ ensure table name is plural & lowercase
  timestamps: true,      // ✅ adds createdAt & updatedAt automatically
});

export default Expense;
