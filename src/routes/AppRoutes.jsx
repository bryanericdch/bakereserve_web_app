import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders"; // <--- ADD THIS IMPORT
import Profile from "../pages/Profile";
import ProtectedRoute from "../components/ProtectedRoute";
import PaymentStatus from "../pages/PaymentStatus";

// Admin Imports
import AdminRoute from "../components/AdminRoute";
import AdminLayout from "../components/AdminLayout";
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

        {/* --- UPDATE THIS ROUTE --- */}
        <Route path="/orders" element={<Orders />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/payment/status" element={<PaymentStatus />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
