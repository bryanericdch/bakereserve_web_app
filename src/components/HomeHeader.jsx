import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import CakeIcon from "@mui/icons-material/Cake"; // Icon for the new button

const HomeHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  // const API_URL = "http://localhost:5000/api";
  const API_URL = "https://bakereserve-api.onrender.com/api";

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!userInfo.token) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(`${API_URL}/cart`, config);
        const count =
          data.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCartCount(count);
      } catch {
        console.error("Failed to fetch cart count");
      }
    };
    fetchCartCount();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/auth");
  };

  const isActive = (path) => location.pathname === path;

  const DrawerList = (
    <div className="w-72 flex flex-col h-full bg-white" role="presentation">
      <div className="p-6 bg-amber-50">
        <h2 className="text-xl font-bold text-gray-800">
          {userInfo.firstName} {userInfo.lastName}
        </h2>
        <p className="text-sm text-gray-500">{userInfo.email}</p>
      </div>
      <Divider />
      <List className="flex-1">
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/profile")}>
            <ListItemText primary="Account Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/orders")}>
            <ListItemText primary="My Orders" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFBF7] px-6 py-4 flex items-center justify-between shadow-sm">
      <h1
        className="text-2xl font-bold text-amber-600 cursor-pointer"
        onClick={() => navigate("/home")}
      >
        BakeReserve
      </h1>

      <nav className="hidden md:flex gap-8 text-gray-700 font-medium items-center">
        <button
          onClick={() => navigate("/home")}
          className={`transition ${isActive("/home") ? "text-amber-600 font-bold" : "hover:text-amber-600"}`}
        >
          Home
        </button>
        <button
          onClick={() => navigate("/home")}
          className="hover:text-amber-600 transition"
        >
          Menu
        </button>
        <button
          onClick={() => navigate("/orders")}
          className={`transition ${isActive("/orders") ? "text-amber-600 font-bold" : "hover:text-amber-600"}`}
        >
          My Orders
        </button>

        {/* --- NEW BUTTON HERE --- */}
        <button
          onClick={() => navigate("/create-cake")}
          className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold hover:bg-amber-200 transition-colors"
        >
          <CakeIcon fontSize="small" /> Create Your Own Cake
        </button>
      </nav>

      <div className="flex items-center gap-6">
        <button className="hover:text-amber-600">
          <SearchIcon />
        </button>
        <button
          className="hover:text-amber-600 relative"
          onClick={() => navigate("/cart")}
        >
          <ShoppingCartIcon />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 h-5 min-w-[20px] flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
        <button
          className="flex items-center gap-2 hover:text-amber-600"
          onClick={() => setOpenDrawer(true)}
        >
          <PersonIcon />
          <span className="text-sm font-semibold hidden sm:block">
            {userInfo.firstName || "User"}
          </span>
        </button>
      </div>

      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        {DrawerList}
      </Drawer>
    </header>
  );
};

export default HomeHeader;
