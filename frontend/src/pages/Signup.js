import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Signup.css"; // ✅ Correct file

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", {
        fullName,
        email,
        password,
        role,
      });
      // Store user and avatar separately
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.avatar) {
          localStorage.setItem("avatar", data.user.avatar);
        } else {
          localStorage.removeItem("avatar");
        }
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      // Redirect admin to admin dashboard
      if (data.user && data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
       

        {/* Heading */}
        <h2 className="signup-title">Create an Account</h2>
        <p className="signup-subtitle">
          
        </p>

        {/* Signup Form */}
        <form onSubmit={submit} className="signup-form">
          
    {/* Role selector with buttons */}
    <div className = "flex items-center justify-center space-x-4 mb-4">
      <button
        type="button"
        onClick={() => setRole ("user")}
        className={`px-4 py-2 rounded-lg border
          ${role === "user" ? "bg-purple-600 text-white" :"bg-grey-200 text-black"}`}
          >
            User
            </button>
      <button
        type="button"
        onClick={() => setRole ("admin")}
        className={`px-4 py-2 rounded-lg border
          ${role === "admin" ? "bg-purple-600 text-white" :"bg-grey-200 text-black"}`}
          >
            Admin
            </button>
    </div>
          {/* Full Name Field */}
          <input
            className="signup-input"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {/* Email Field */}
          <input
            className="signup-input"
            placeholder="Enter User Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Field */}
          <input
            className="signup-input"
            placeholder="Min 8 Characters"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

         <button
  type="submit"
  className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
>
  SIGN UP
</button>

        </form>

        <p className="text-center mt-4">
  Already have an account?{" "}
  <Link to="/login" className="text-purple-600">
    Login
  </Link>
</p>

      </div>
    </div>
  );
}
