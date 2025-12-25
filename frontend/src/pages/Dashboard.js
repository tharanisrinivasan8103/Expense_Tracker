
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({ balance: 0, income: 0, expense: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const res = await api.get("/dashboard");
        console.log("dashboard response:", res.data); // Debugging log
        setData(res.data);
      } catch (err) {
        console.error(
          "Error fetching dashboard data:",
          err.response ? err.response.data : err
        );
      }
    };
    fetchData();
  }, []);


  const pieData = [
    { name: "Balance", value: data.balance },
    { name: "Income", value: data.income },
    { name: "Expense", value: data.expense },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ff6b6b"];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-gray-500 font-medium">Balance</p>
            <h2 className="text-3xl font-bold text-gray-800">₹{data.balance}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-gray-500 font-medium">Income</p>
            <h3 className="text-2xl font-semibold text-green-600">
              ₹{data.income}
            </h3>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-gray-500 font-medium">Expense</p>
            <h3 className="text-2xl font-semibold text-red-600">
              ₹{data.expense}
            </h3>
          </div>
        </div>

        {/* Financial Overview Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">
            Financial Overview
          </h4>
          <div className="flex justify-center">
            <PieChart width={400} height={300}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
}
