import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Logout from "./pages/Logout";
import ResetPassword from "./pages/ResetPassword";

import Sidebar from "./components/Sidebar";

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path='/' element={<Login/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/admin/dashboard' element={<AdminDashboard/>} />
        <Route path='/income' element={<Income/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path='/expense' element={<Expense/>} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}
