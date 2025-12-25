// src/pages/Expense.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/Sidebar";
import "../styles/Expense.css";
import api from "../api"; // ✅ use central axios instance
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Expense() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch expenses from backend
  const fetchTxs = async () => {
    try {
      const { data } = await api.get("/transactions/expense"); // ✅ corrected (removed /api)
      setTransactions(data);
    } catch (err) {
      console.error(
        "Error fetching expenses:",
        err.response || err.message || err
      );
      alert("Failed to fetch expenses — check console for details.");
    }
  };

  // ✅ Add new expense
  const addExpense = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category,
        amount,
        date: new Date(), // ✅ include today's date
      };

      await api.post("/transactions/expense", payload); // ✅ corrected (removed /api)

      fetchTxs(); // refresh list

      setCategory("");
      setAmount("");
    } catch (err) {
      console.error("Error adding expense:", err.response || err.message || err);
      alert(err.response?.data?.message || "Error adding expense");
    }
  };

  // ✅ Delete an expense
  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/transactions/expense/${id}`); // ✅ corrected (removed /api)
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err.response || err.message || err);
      alert("Failed to delete expense");
    }
  };

  // Download handler for Excel
  const handleDownload = () => {
    if (!transactions.length) {
      alert("No expense data to export.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(
      transactions.map((t) => ({
        Category: t.category,
        Amount: t.amount,
        Date: t.date ? new Date(t.date).toLocaleString() : "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expense");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "expense.xlsx");
  };

  // ✅ Load transactions when page mounts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
      return;
    }
    fetchTxs();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">Expense Management</h2>

        {/* Expense Form */}
        <form
          className="flex gap-4 mb-6 bg-white p-4 shadow-md rounded-xl"
          onSubmit={addExpense}
        >
          <input
            type="text"
            placeholder="Expense Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="border rounded-lg px-4 py-2 flex-1"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="border rounded-lg px-4 py-2 w-32"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Add Expense
          </button>
        </form>

        {/* Expense List */}
        <section className="bg-white p-4 shadow-md rounded-xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Expense List</h3>
            <button
              onClick={handleDownload}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
            >
              Download Excel
            </button>
          </div>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No expenses yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg"
                >
                  <span className="text-gray-700">
                    {t.category} - ₹{t.amount}
                  </span>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => deleteExpense(t.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Chart Section */}
        <section className="bg-white p-4 shadow-md rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Expense Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </main>
    </div>
  );
}
