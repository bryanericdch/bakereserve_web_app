import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";
import Profile from "../pages/Profile";
import PaymentStatus from "../pages/PaymentStatus";
import ProtectedRoute from "../components/ProtectedRoute";
import CreateCake from "../pages/CreateCake";
import ProductDetails from "../pages/ProductDetails";
import AboutUs from "../pages/AboutUs";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";

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
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Customer Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payment/status" element={<PaymentStatus />} />

        {/* --- ADD THESE MISSING ROUTES --- */}
        <Route path="/create-cake" element={<CreateCake />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Route>
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
