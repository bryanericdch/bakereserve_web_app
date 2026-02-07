import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  // Check if user exists AND is an admin
  return userInfo && userInfo.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/auth" replace />
  );
};

export default AdminRoute;
