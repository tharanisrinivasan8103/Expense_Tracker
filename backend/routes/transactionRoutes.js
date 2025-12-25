import express from "express";
import auth from "../middleware/authMiddleware.js";
import { addIncome, getIncomes, deleteIncome, addExpense, getExpenses, deleteExpense } from "../controllers/transactionController.js";

const router = express.Router();

router.post("/income", auth, addIncome);
router.get("/income", auth, getIncomes);
router.delete("/income/:id", auth, deleteIncome);

router.post("/expense", auth, addExpense);
router.get("/expense", auth, getExpenses);
router.delete("/expense/:id", auth, deleteExpense);

export default router;
