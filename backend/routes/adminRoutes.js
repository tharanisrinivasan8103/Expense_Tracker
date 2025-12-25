import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { Op, fn, col, literal } from "sequelize";
import User from "../models/User.js";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

const router = express.Router();

// ✅ Admin Registration Route (forces role = 'admin')
router.post("/register", async (req, res, next) => {
  try {
    req.body.role = "admin"; // Force role to admin
    return next();
  } catch (error) {
    console.error("Error in admin register middleware:", error);
    return res.status(500).json({ message: "Error in registration middleware" });
  }
}, registerUser);

// ✅ Admin Login Route (ensures admin login only)
router.post("/login", async (req, res, next) => {
  try {
    req.body.requireRole = "admin";
    return next();
  } catch (error) {
    console.error("Error in admin login middleware:", error);
    return res.status(500).json({ message: "Error in login middleware" });
  }
}, loginUser);

// Get User Transactions
router.get("/user-transactions/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Sum incomes and expenses separately (app stores them in separate tables)
    const incomeSum = await Income.sum('amount', { where: { userId } }) || 0;
    const expenseSum = await Expense.sum('amount', { where: { userId } }) || 0;

    const result = {
      income: Number(incomeSum || 0),
      expense: Number(expenseSum || 0)
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: "Error fetching user transactions" });
  }
});

// Get All Users with Transaction Summaries (robust grouped query)
router.get("/users-summary", async (req, res) => {
  try {
    // Fetch basic user info
    const users = await User.findAll({
      attributes: ['id', 'fullName', 'email'],
      raw: true,
    });

    // Aggregate incomes and expenses per user separately (the app writes to incomes & expenses tables)
    const incomeSums = await Income.findAll({
      attributes: ['userId', [fn('SUM', col('amount')), 'total']],
      group: ['userId'],
      raw: true,
    });
    const expenseSums = await Expense.findAll({
      attributes: ['userId', [fn('SUM', col('amount')), 'total']],
      group: ['userId'],
      raw: true,
    });

    const sumsByUser = {};
    incomeSums.forEach(t => {
      const uid = t.userId;
      if (!sumsByUser[uid]) sumsByUser[uid] = { income: 0, expense: 0 };
      sumsByUser[uid].income = Number(t.total || 0);
    });
    expenseSums.forEach(t => {
      const uid = t.userId;
      if (!sumsByUser[uid]) sumsByUser[uid] = { income: 0, expense: 0 };
      sumsByUser[uid].expense = Number(t.total || 0);
    });

    // Merge and format
    const formatted = users.map(u => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      income: Number((sumsByUser[u.id] && sumsByUser[u.id].income) || 0),
      expense: Number((sumsByUser[u.id] && sumsByUser[u.id].expense) || 0),
    }));

    console.log('Users summary (formatted):', formatted);
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching users summary:", error);
    res.status(500).json({ message: "Error fetching users summary" });
  }
});

// Dashboard Stats (real-time data from DB)
router.get("/dashboard-stats", async (req, res) => {
  try {
    // Total users (with error handling)
    let totalUsers = 0;
    try {
      totalUsers = await User.count();
    } catch (err) {
      console.error('Error counting users:', err);
    }

    // Active users (with error handling)
    let activeUsers = 0;
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      activeUsers = await User.count({
        where: {
          lastLoginAt: { [Op.gte]: thirtyDaysAgo },
        },
      });
    } catch (err) {
      console.error('Error counting active users:', err);
    }

    // Total transactions & revenue/expense from Income/Expense tables
    let totalTransactions = 0;
    let totalRevenue = 0;
    let totalExpense = 0;
    try {
      const incomeCount = await Income.count();
      const expenseCount = await Expense.count();
      totalTransactions = incomeCount + expenseCount;
      
      totalRevenue = await Income.sum("amount") || 0;
      totalExpense = await Expense.sum("amount") || 0;

      console.log('Debug totals:', { totalRevenue, totalExpense, totalTransactions });
    } catch (err) {
      console.error('Error counting transactions/revenue:', err);
    }

    // Monthly Activity (last 6 months) with default values - derive from Income & Expense
    let monthlyActivity = [];
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

      // Get monthly aggregates from Income and Expense separately, then combine
      const incomeMonthly = await Income.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("createdAt"), "%b"), "month"],
          [fn("COUNT", col("id")), "transactions"],
          [fn("COUNT", fn("DISTINCT", col("userId"))), "users"]
        ],
        where: { createdAt: { [Op.gte]: sixMonthsAgo } },
        group: [fn("DATE_FORMAT", col("createdAt"), "%b")],
        raw: true,
      });

      const expenseMonthly = await Expense.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("createdAt"), "%b"), "month"],
          [fn("COUNT", col("id")), "transactions"],
          [fn("COUNT", fn("DISTINCT", col("userId"))), "users"]
        ],
        where: { createdAt: { [Op.gte]: sixMonthsAgo } },
        group: [fn("DATE_FORMAT", col("createdAt"), "%b")],
        raw: true,
      });

      const activityMap = new Map();

      incomeMonthly.forEach(m => {
        const key = m.month;
        activityMap.set(key, {
          month: key,
          users: Number(m.users || 0),
          transactions: Number(m.transactions || 0)
        });
      });

      expenseMonthly.forEach(m => {
        const key = m.month;
        const existing = activityMap.get(key) || { month: key, users: 0, transactions: 0 };
        existing.users = Number(existing.users || 0) + Number(m.users || 0);
        existing.transactions = Number(existing.transactions || 0) + Number(m.transactions || 0);
        activityMap.set(key, existing);
      });

      monthlyActivity = months.map(month => ({
        month,
        users: Number((activityMap.get(month) || {}).users || 0),
        transactions: Number((activityMap.get(month) || {}).transactions || 0)
      }));
    } catch (err) {
      console.error('Error getting monthly activity:', err);
      monthlyActivity = [];
    }

    // Category Distribution (for expenses) with error handling and defaults - use Expense table
    let formattedCategories = [];
    try {
      const categoryDistribution = await Expense.findAll({
        attributes: [
          ["category", "label"],
          [fn("COUNT", col("id")), "value"],
        ],
        group: ["category"],
        raw: true,
      });

      formattedCategories = categoryDistribution.map(r => ({
        label: String(r.label || 'Other'),
        value: Number(r.value || 0),
      }));

      // If no data, provide defaults
      if (formattedCategories.length === 0) {
        formattedCategories = [
          { label: 'Food', value: 0 },
          { label: 'Transport', value: 0 },
          { label: 'Entertainment', value: 0 },
          { label: 'Shopping', value: 0 },
          { label: 'Other', value: 0 }
        ];
      }
    } catch (err) {
      console.error('Error getting category distribution:', err);
      formattedCategories = [];
    }

    // Top Users (by total expenses) with error handling and defaults - use Expense table
    let formattedTopUsers = [];
    try {
      const topUsers = await User.findAll({
        attributes: [
          ["fullName", "name"],
          [fn("COALESCE", fn("SUM", col("Expenses.amount")), 0), "expenses"],
          [fn("COALESCE", fn("COUNT", col("Expenses.id")), 0), "transactions"],
          [fn("COALESCE", fn("AVG", col("Expenses.amount")), 0), "avgAmount"]
        ],
        include: [
          {
            model: Expense,
            attributes: [],
            required: false
          }
        ],
        group: ["User.id", "User.fullName"],
        order: [[fn("SUM", col("Expenses.amount")), "DESC"]],
        limit: 5,
        raw: true
      });

      formattedTopUsers = topUsers.map(r => ({
        name: String(r.name || 'Anonymous'),
        expenses: Number(r.expenses || 0),
        transactions: Number(r.transactions || 0),
        avgAmount: Number(r.avgAmount || 0)
      }));
    } catch (err) {
      console.error('Error getting top users:', err);
      formattedTopUsers = [];
    }

    // ✅ Send dashboard data with explicit type conversion
      return res.json({
      totalUsers: Number(totalUsers || 0),
      activeUsers: Number(activeUsers || 0),
      totalTransactions: Number(totalTransactions || 0),
      totalRevenue: Number(totalRevenue || 0),
      totalExpense: Number(totalExpense || 0),
      monthlyActivity: Array.isArray(monthlyActivity) ? monthlyActivity : [],
      categoryDistribution: Array.isArray(formattedCategories) ? formattedCategories : [],
      topUsers: Array.isArray(formattedTopUsers) ? formattedTopUsers : []
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    // Send safe defaults if there's an error
    res.json({
      totalUsers: 0,
      activeUsers: 0,
      totalTransactions: 0,
      totalRevenue: 0,
      monthlyActivity: [],
      categoryDistribution: [],
      topUsers: []
    });
  }
});

export default router;
