import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Check if user info exists in localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // If user is logged in, show the page (Outlet)
  // If not, redirect to /auth
  return userInfo ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
