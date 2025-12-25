// src/pages/Income.js
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import Sidebar from "../components/Sidebar";
import "../styles/Income.css";
import api from "../api";

export default function Income() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [incomes, setIncomes] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch incomes from backend
  const fetchIncomes = async () => {
    try {
      const { data } = await api.get("/transactions/income");
      setIncomes(data);
    } catch (err) {
      console.error("Error fetching incomes:", err.response || err.message || err);
      alert("Failed to fetch incomes — check console for details.");
    }
  };

  // ✅ Add new income
  const addIncome = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category,
        amount: Number(amount),
        date: new Date(),
      };

      await api.post("/transactions/income", payload);

      fetchIncomes();
      setCategory("");
      setAmount("");
    } catch (err) {
      console.error("Error adding income:", err.response || err.message || err);
      alert(err.response?.data?.message || "Error adding income");
    }
  };

  // ✅ Delete income
  const deleteIncome = async (id) => {
    if (!window.confirm("Delete this income?")) return;
    try {
      await api.delete(`/transactions/income/${id}`);
      setIncomes((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Error deleting income:", err.response || err.message || err);
      alert("Failed to delete income");
    }
  };

  // Download handler for Excel
  const handleDownload = () => {
    if (!incomes.length) {
      alert("No income data to export.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(
      incomes.map((i) => ({
        Category: getCategory(i.category),
        Amount: i.amount,
        Date: i.date ? new Date(i.date).toLocaleString() : "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Income");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "income.xlsx");
  };

  // ✅ Load incomes on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
      return;
    }
    fetchIncomes();
  }, [navigate]);

  // 🔎 Helper to safely extract category
  const getCategory = (cat) => {
    if (typeof cat === "string") return cat;
    if (cat && typeof cat === "object") {
      // If it's a React element, return a placeholder string
      if (cat.$$typeof) return "Custom";
      // If it's a plain object, try to get a name property or fallback
      return cat.name || JSON.stringify(cat);
    }
    return "Unknown";
  };

  console.log("Income objects:", incomes);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">Income Management</h2>

        {/* Income Form */}
        <form
          className="flex gap-4 mb-6 bg-white p-4 shadow-md rounded-xl"
          onSubmit={addIncome}
        >
          <input
            type="text"
            placeholder="Income Source"
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
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Add Income
          </button>
        </form>

        {/* Income List */}
        <section className="bg-white p-4 shadow-md rounded-xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Income List</h3>
            <button
              onClick={handleDownload}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Download Excel
            </button>
          </div>
          {incomes.length === 0 ? (
            <p className="text-gray-500">No incomes yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {incomes.map((i) => (
                <div
                  key={i.id}
                  className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg"
                >
                  <span className="text-gray-700">
                    {getCategory(i.category)} - ₹{i.amount}
                  </span>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => deleteIncome(i.id)}
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
          <h3 className="text-xl font-semibold mb-4">Income Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incomes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tickFormatter={getCategory} />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} labelFormatter={getCategory} />
              <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </main>
    </div>
  );
}
