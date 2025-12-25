import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    // Clear user data
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("avatar");
    // Redirect to login
    navigate("/login");
  }, [navigate]);
  return null;
}
