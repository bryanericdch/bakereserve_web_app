import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

const DRAWER_WIDTH = 240;
const API_URL = "https://bakereserve-api.onrender.com/api";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = userInfo?.token
    ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
    : null;

  useEffect(() => {
    if (!config) return;
    const fetchNotifs = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/notifications`, config);
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchNotifs();
  }, [location.pathname]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/auth");
  };

  const handleReadNotif = async (notification) => {
    try {
      if (!notification.isRead && config) {
        await axios.put(
          `${API_URL}/notifications/${notification._id}/read`,
          {},
          config,
        );
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n,
          ),
        );
      }
      setNotifAnchor(null);
      if (
        notification.title &&
        notification.title.includes("High Cancellation Alert")
      ) {
        navigate("/admin/users");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Failed to process notification click", error);
    }
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Products", icon: <InventoryIcon />, path: "/admin/products" },
    { text: "Users", icon: <PeopleAltIcon />, path: "/admin/users" },
  ];

  const drawerContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 text-center border-b border-slate-700">
        <h3 className="text-2xl font-bold text-amber-500 tracking-wider">
          Bake<span className="text-amber-500">Reserve</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
          Admin Panel
        </p>
      </div>
      <List className="flex-1 mt-4">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                margin: "4px 12px",
                borderRadius: "8px",
                backgroundColor:
                  location.pathname === item.path ? "#f59e0b" : "transparent",
                "&:hover": {
                  backgroundColor:
                    location.pathname === item.path
                      ? "#d97706"
                      : "rgba(255,255,255,0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? "white" : "#94a3b8",
                  minWidth: "40px",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight:
                    location.pathname === item.path ? "bold" : "medium",
                  color: location.pathname === item.path ? "white" : "#94a3b8",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <div className="md:hidden fixed top-4 left-4 z-50">
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{ bgcolor: "white", boxShadow: 1 }}
        >
          <MenuIcon />
        </IconButton>
      </div>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              border: "none",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm h-16 flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <IconButton
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              sx={{ p: 1 }}
            >
              <Badge
                color="error"
                variant="dot"
                invisible={notifications.filter((n) => !n.isRead).length === 0}
              >
                <NotificationsNoneIcon className="text-gray-600" />
              </Badge>
            </IconButton>

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
                <h4 className="font-bold text-gray-800 m-0">
                  Admin Notifications
                </h4>
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
                      className={`p-3 border-b text-sm cursor-pointer transition flex flex-col items-start hover:bg-gray-100 ${n.isRead ? "bg-white opacity-60" : "bg-amber-50/30 font-medium"}`}
                    >
                      {n.title && (
                        <p className="font-bold text-gray-800 m-0">{n.title}</p>
                      )}
                      <p className="text-gray-700 m-0 mt-1">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Popover>

            <span className="text-sm font-medium text-gray-600 hidden sm:block">
              Admin
            </span>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <PersonIcon />
              </div>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 150 } }}
            >
              <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
