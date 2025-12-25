
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password, role });

      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user?.avatar) {
        localStorage.setItem("avatar", res.data.user.avatar);
      } else {
        localStorage.removeItem("avatar");
      }

      
      // If server says admin, go to admin dashboard
      if (res.data.user && res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={submit} className="space-y-4">
          {/* Role selector replaced with buttons */}
<div className="flex items-center justify-center space-x-4 mb-2">
  <button
    type="button"
    onClick={() => setRole("user")}
    className={`px-4 py-2 rounded-lg border 
      ${role === "user" ? "bg-purple-600 text-white" : "bg-gray-200 text-black"}`}
  >
    User
  </button>

  <button
    type="button"
    onClick={() => setRole("admin")}
    className={`px-4 py-2 rounded-lg border 
      ${role === "admin" ? "bg-purple-600 text-white" : "bg-gray-200 text-black"}`}
  >
    Admin
  </button>
</div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-3">
          <Link to="/reset-password" className="text-sm text-purple-600 hover:underline">
            Reset password
          </Link>
        </div>
        <p className="text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
