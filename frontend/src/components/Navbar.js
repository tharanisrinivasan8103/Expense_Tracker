import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  User,
  LogOut,
} from "lucide-react"; // lucide-react icons

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Income", path: "/income", icon: <Wallet size={20} /> },
    { name: "Expense", path: "/expense", icon: <Receipt size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col items-center py-6">
      {/* Avatar & User Info */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="https://avatars.githubusercontent.com/u/9919?s=280&v=4" // Replace with user avatar if you have one
          alt="avatar"
          className="w-20 h-20 rounded-full border-4 border-purple-500"
        />
        <h2 className="mt-3 font-semibold text-gray-800">
          {user?.name || "User"}
        </h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      {/* Menu */}
      <nav className="w-full flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? "bg-purple-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors mt-4 w-[90%]"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}
