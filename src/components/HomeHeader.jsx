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
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Popover from "@mui/material/Popover";
import Badge from "@mui/material/Badge"; // <-- ADDED BADGE

const API_URL = "https://bakereserve-api.onrender.com/api";

const HomeHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const [notifications, setNotifications] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    if (!userInfo.token) return;

    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    const fetchCartCount = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/cart`, config);
        const count =
          data.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCartCount(count);
      } catch {
        console.error("Failed to fetch cart count");
      }
    };

    const fetchNotifs = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/notifications`, config);
        setNotifications(data);
      } catch {
        console.error("Failed to fetch notifications");
      }
    };

    fetchCartCount();
    fetchNotifs();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/auth");
  };

  const isActive = (path) => location.pathname === path;

  const scrollToMenu = () => {
    if (location.pathname !== "/home") {
      navigate("/home");
      setTimeout(
        () =>
          document
            .getElementById("menu-section")
            ?.scrollIntoView({ behavior: "smooth" }),
        300,
      );
    } else {
      document
        .getElementById("menu-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToFooter = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    setOpenDrawer(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setTimeout(
        () =>
          document
            .getElementById("menu-section")
            ?.scrollIntoView({ behavior: "smooth" }),
        300,
      );
    }
  };

  const handleReadNotif = async (notif) => {
    if (notif.isRead) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${API_URL}/notifications/${notif._id}/read`, {}, config);
      setNotifications(
        notifications.map((n) =>
          n._id === notif._id ? { ...n, isRead: true } : n,
        ),
      );
    } catch {
      console.error("Failed to mark as read");
    }
  };

  const DrawerList = (
    <div className="w-72 flex flex-col h-full bg-white" role="presentation">
      <div className="p-6 bg-amber-50">
        <h2 className="text-xl font-bold text-gray-800">
          {userInfo.firstName} {userInfo.lastName}
        </h2>
        <p className="text-sm text-gray-500">{userInfo.email}</p>
        {/* Reminder inside Drawer */}
        {!userInfo.address && (
          <p
            className="text-xs text-red-500 mt-2 font-bold cursor-pointer hover:underline"
            onClick={() => {
              setOpenDrawer(false);
              navigate("/profile");
            }}
          >
            ⚠ Action required: Please add your address.
          </p>
        )}
      </div>
      <Divider />
      <List className="flex-1">
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              navigate("/home");
              setOpenDrawer(false);
            }}
          >
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              scrollToMenu();
              setOpenDrawer(false);
            }}
          >
            <ListItemText primary="Menu" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              navigate("/about");
              setOpenDrawer(false);
            }}
          >
            <ListItemText primary="About Us" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={scrollToFooter}>
            <ListItemText primary="Contact Us" />
          </ListItemButton>
        </ListItem>
        <Divider className="my-2" />
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
    <header className="sticky top-0 z-50 w-full bg-[#FFFBF7] px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
      <h1
        className="text-xl md:text-2xl font-bold text-amber-600 cursor-pointer"
        onClick={() => navigate("/home")}
      >
        BakeReserve
      </h1>
      <nav className="hidden md:flex gap-6 lg:gap-8 text-gray-700 font-medium items-center text-sm lg:text-base">
        <button
          onClick={() => navigate("/home")}
          className={`transition ${isActive("/home") ? "text-amber-600 font-bold" : "hover:text-amber-600"}`}
        >
          Home
        </button>
        <button
          onClick={scrollToMenu}
          className="hover:text-amber-600 transition"
        >
          Menu
        </button>
        <button
          onClick={() => navigate("/about")}
          className={`transition ${isActive("/about") ? "text-amber-600 font-bold" : "hover:text-amber-600"}`}
        >
          About Us
        </button>
        <button
          onClick={scrollToFooter}
          className="hover:text-amber-600 transition"
        >
          Contact Us
        </button>
      </nav>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center h-10">
          {searchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-white border border-amber-300 rounded-full px-3 py-1 shadow-sm transition-all duration-300 w-40 md:w-56"
            >
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full py-1 text-gray-700"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <CloseIcon fontSize="small" />
              </button>
            </form>
          ) : (
            <button
              className="text-gray-700 hover:text-amber-600 p-1"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>
          )}
        </div>

        <button
          className="text-gray-700 hover:text-amber-600 relative p-1 transition-colors"
          onClick={(e) => setNotifAnchor(e.currentTarget)}
        >
          <NotificationsNoneIcon />
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: { width: 320, maxHeight: 400, mt: 1.5, borderRadius: 2 },
          }}
        >
          <div className="p-3 border-b bg-gray-50">
            <h4 className="font-bold text-gray-800 m-0">Notifications</h4>
          </div>
          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleReadNotif(n)}
                  className={`p-3 border-b text-sm cursor-pointer transition ${n.isRead ? "bg-white opacity-60" : "bg-amber-50/30 font-medium"}`}
                >
                  <p className="text-gray-800 m-0">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Popover>

        <button
          className="text-gray-700 hover:text-amber-600 relative p-1 transition-colors"
          onClick={() => navigate("/cart")}
        >
          <ShoppingCartIcon />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 h-5 min-w-[20px] flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>

        <button
          className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors p-1"
          onClick={() => setOpenDrawer(true)}
        >
          {/* --- NEW: RED DOT IF NO ADDRESS --- */}
          <Badge color="error" variant="dot" invisible={!!userInfo.address}>
            <PersonIcon />
          </Badge>
          <span className="text-sm font-semibold hidden sm:block truncate max-w-[100px]">
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
