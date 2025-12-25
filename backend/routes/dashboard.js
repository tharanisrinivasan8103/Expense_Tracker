
import express from "express";
import auth from "../middleware/authMiddleware.js";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

const router = express.Router();


router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User not identified" });
    }

    
    const incomes = await Income.findAll({ where: { userId } });
    const expenses = await Expense.findAll({ where: { userId } });

   
    const incomeTotal = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const balance = incomeTotal - expenseTotal;

   
    res.json({
      balance,
      income: incomeTotal,
      expense: expenseTotal,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
