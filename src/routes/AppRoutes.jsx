import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Cart from "../pages/Cart";
import ProtectedRoute from "../components/ProtectedRoute";

// Admin Imports
import AdminRoute from "../components/AdminRoute";
import AdminLayout from "../components/AdminLayout"; // <--- Import Layout
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      {/* Customer Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/orders"
          element={
            <div className="p-10 text-center">
              <h1>My Orders</h1>
            </div>
          }
        />
        <Route
          path="/profile"
          element={
            <div className="p-10 text-center">
              <h1>Profile</h1>
            </div>
          }
        />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        {/* WRAP ADMIN PAGES IN THE LAYOUT */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          {/* Create this page next! */}
          <Route
            path="/admin/products"
            element={
              <div className="p-10">
                <h1>Inventory Management (Coming Soon)</h1>
              </div>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
