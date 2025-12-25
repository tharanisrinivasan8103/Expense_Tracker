import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, BarChart3, LogOut, Receipt, User } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  // Always read user from localStorage on render
  const user = JSON.parse(localStorage.getItem("user"));
  // Fallback to avatar from localStorage if not logged in
  const avatar = user?.avatar || localStorage.getItem("avatar") || "https://img.icons8.com/windows/32/gender-neutral-user.png";

  // Sidebar menu items
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Income", icon: <Wallet size={20} />, path: "/income" },
    { name: "Expense", icon: <Receipt size={20} />, path: "/expense" },
    { name: "Profile", icon: <User size={20} />, path: "/profile" },
  ];

  return (
    <div className="h-screen w-64 bg-white shadow-lg flex flex-col justify-between p-4">
      {/* Top Section */}
      <div>
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={avatar}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-purple-400 bg-white object-contain p-1"
          />
          <h2 className="mt-3 text-lg font-semibold text-gray-800">
            {user?.fullName || "Guest"}
          </h2>
          <p className="text-sm text-gray-500 text-center">
            {user?.email || "guest@example.com"}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                location.pathname === item.path
                  ? "bg-purple-600 text-white"
                  : "text-gray-700 hover:bg-purple-100"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <Link
        to="/logout"
        className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </Link>
    </div>
  );
}
