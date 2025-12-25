
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";


export const addIncome = async (req, res) => {
  try {
    const { category, amount } = req.body;

    const income = await Income.create({
      category,
      amount,
      userId: req.user.id,  
      date: new Date()
    });

    res.json(income);
  } catch (err) {
    console.error("Error adding income:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.findAll({
      where: { userId: req.user.id },
      order: [["date", "DESC"]],
    });
    res.json(incomes);
  } catch (err) {
    console.error("Error fetching incomes:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteIncome = async (req, res) => {
  try {
    await Income.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ message: "Income deleted" });
  } catch (err) {
    console.error("Error deleting income:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const addExpense = async (req, res) => {
  try {
    const { category, amount } = req.body;

    const expense = await Expense.create({
      category,
      amount,
      userId: req.user.id,  
      date: new Date()
    });

    res.json(expense);
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      order: [["date", "DESC"]],
    });
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await Expense.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Server error" });
  }
};
