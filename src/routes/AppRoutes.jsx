import { Routes, Route } from "react-router-dom";
// Public
import Landing from "../pages/Landing";
import Auth from "../pages/Auth";
import Products from "../pages/Products";

// Customer
import Home from "../pages/Home";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/products" element={<Products />} />

      {/* Customer */}
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
