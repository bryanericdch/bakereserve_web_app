import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Cart from "../pages/Cart"; // Import Cart

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} /> {/* Add Route */}
    </Routes>
  );
};

export default AppRoutes;
