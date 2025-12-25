import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// sidebar intentionally removed for admin dashboard view
import api from "../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    monthlyActivity: [],
    categoryDistribution: [],
    topUsers: [],
  });
  const [users, setUsers] = useState([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes] = await Promise.all([
          api.get("/admin/dashboard-stats"),
          api.get("/admin/users-summary"),
        ]);
        setStats(statsRes.data || {});
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error("Error fetching admin data:", err.response || err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUserClick = async (user) => {
    try {
      setSelectedUserDetails({ loading: true, user, data: null });
      const res = await api.get(`/admin/user-transactions/${user.id}`);
      setSelectedUserDetails({ loading: false, user, data: res.data });
    } catch (err) {
      console.error("Error fetching user transactions:", err.response || err);
      setSelectedUserDetails({ loading: false, user, data: { income: 0, expense: 0 } });
    }
  };

  // Do not early-return here; render a loading state inside JSX so hooks order stays stable
  // (avoids 'Rendered more hooks than during the previous render' during HMR)

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("avatar");
    navigate("/");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
      <div className="flex-1">
        {/* single header only - removed duplicate */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-gray-500 font-medium">Total Users</p>
            <h2 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-gray-500 font-medium">Total Expense</p>
            <h3 className="text-2xl font-semibold text-red-600">₹{stats.totalExpense}</h3>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-gray-500 font-medium">Total Income</p>
            <h3 className="text-2xl font-semibold text-green-600">₹{stats.totalRevenue}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Users</h3>
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-right">Income</th>
                    <th className="px-4 py-2 text-right">Expense</th>
                    <th className="px-4 py-2 text-right">Balance</th>
                  </tr>
                </thead>
              <tbody>
                {users.filter(u => u.email !== "admin@gmail.com").map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2 text-purple-600 cursor-pointer" onClick={() => handleUserClick(u)}>
                      {u.email}
                    </td>
                      <td className="px-4 py-2 text-right">₹{u.income}</td>
                      <td className="px-4 py-2 text-right">₹{u.expense}</td>
                      <td className="px-4 py-2 text-right">₹{(Number(u.income || 0) - Number(u.expense || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUserDetails && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h4 className="text-lg font-semibold mb-2">User Details</h4>
            <p className="text-sm text-gray-600">Name: {selectedUserDetails.user.name}</p>
            <p className="text-sm text-gray-600">Email: {selectedUserDetails.user.email}</p>
            {selectedUserDetails.loading ? (
              <p className="mt-2">Loading transactions...</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded">
                  <p className="text-sm text-gray-500">Income</p>
                  <p className="text-2xl font-bold">₹{selectedUserDetails.data?.income || 0}</p>
                </div>
                <div className="p-4 bg-red-50 rounded">
                  <p className="text-sm text-gray-500">Expense</p>
                  <p className="text-2xl font-bold">₹{selectedUserDetails.data?.expense || 0}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
