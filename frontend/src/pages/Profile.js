import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // ✅ Make sure you have Sidebar imported

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        navigate("/login"); // redirect if no user found
      } else {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Error loading user from localStorage", error);
    }
  }, [navigate]);

  if (!user) {
    return <div className="text-center mt-10 text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Sidebar */}
      <Sidebar user={user} />

      {/* Right Content */}
      <div className="flex-1 flex justify-center items-start p-10">
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-2xl">
          <div className="flex items-center gap-6">
            <img
              src={user.avatar || localStorage.getItem("avatar") || "https://img.icons8.com/windows/32/gender-neutral-user.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-purple-500 bg-white object-contain p-1"
            />
            <div>
              <h2 className="text-xl font-bold">{user.fullName || "Guest"}</h2>
              <p className="text-gray-500">{user.email || "guest@example.com"}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/edit-profile")}
            className="mt-6 bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
