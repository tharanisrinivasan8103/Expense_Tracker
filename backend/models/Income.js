// ✅ Updated backend/models/Income.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Income = sequelize.define("Income", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  category: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW, // fallback to today if not sent from frontend
  },
  userId: { type: DataTypes.INTEGER, allowNull: true }, // store which user added this
}, {
  tableName: "incomes",  // makes table name lowercase plural, avoids Sequelize's defaults
  timestamps: true,      // adds createdAt & updatedAt automatically
});

export default Income;
