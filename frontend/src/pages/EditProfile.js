import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";
import Sidebar from "../components/Sidebar";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ fullName: "", email: "", avatar: "" });
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef(null);


  // Get logged-in user id from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  // Redirect to login if not logged in
  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  // ✅ Fetch user details
  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
        setPreview(res.data.avatar || "");
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };
    fetchUser();
  }, [userId]);

  // Image preview validation: ensure preview is a safe URL or data URI
  const isValidPreview = (p) => {
    if (!p) return false;
    try {
      // data URI or http(s) URL are acceptable
      return p.startsWith("data:") || p.startsWith("http://") || p.startsWith("https://");
    } catch (err) {
      return false;
    }
  };

  // Handle user selecting a local image file
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Basic validations
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (jpg, png, gif, etc.)");
      return;
    }
    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) {
      alert("Image is too large. Please pick an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setUser((prev) => ({ ...prev, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // ✅ Save profile changes
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/users/${userId}`, user);
      // Update localStorage with new user data
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // Store avatar separately so it persists after logout
      if (res.data.user.avatar) {
        localStorage.setItem("avatar", res.data.user.avatar);
      }
      window.location.reload(); // Force all components to re-read user data
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} />
      <div className="flex-1 flex justify-center items-start p-10">
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <img
                src={isValidPreview(preview) ? preview : "https://img.icons8.com/windows/32/gender-neutral-user.png"}
                alt="Preview"
                className="w-24 h-24 rounded-full border-2 border-purple-500 object-cover"
              />

              {/* Visible choose-file button that opens the hidden file input */}
              <div>
                <label
                  htmlFor="avatarFile"
                  className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full cursor-pointer hover:bg-purple-200"
                >
                  Choose File
                </label>
                <input
                  id="avatarFile"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-medium">Full Name</label>
              <input
                type="text"
                value={user.fullName}
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                className="mt-1 block w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium">Email</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="mt-1 block w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-purple-300"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="bg-gray-300 text-gray-800 px-5 py-2 rounded-xl hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
