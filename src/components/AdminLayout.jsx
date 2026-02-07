import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory"; // Box icon for Products
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

const DRAWER_WIDTH = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null); // For Profile Menu
  const [mobileOpen, setMobileOpen] = useState(false); // For Mobile Sidebar

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  // Handle Profile Menu
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/auth");
  };

  // Navigation Links
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Products", icon: <InventoryIcon />, path: "/admin/products" },
  ];

  // Sidebar Content
  const drawerContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo Area */}
      <div className="p-6 text-center border-b border-slate-700">
        <h1 className="text-2xl font-bold text-amber-500 tracking-wider">
          BakeReserve
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
          Admin Panel
        </p>
      </div>

      {/* Links */}
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
                  location.pathname === item.path ? "#f59e0b" : "transparent", // Amber-500 if active
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

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-700 text-center">
        <p className="text-sm font-semibold">
          {userInfo.firstName} {userInfo.lastName}
        </p>
        <p className="text-xs text-slate-400">{userInfo.email}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Mobile Menu Button (Visible only on small screens) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{ bgcolor: "white", boxShadow: 1 }}
        >
          <MenuIcon />
        </IconButton>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
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
        {/* Desktop Drawer (Permanent) */}
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

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-end px-8 sticky top-0 z-10">
          {/* Profile Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">
              Admin
            </span>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <PersonIcon />
              </div>
            </IconButton>

            {/* The Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                elevation: 3,
                sx: { mt: 1.5, minWidth: 150 },
              }}
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

        {/* Page Content (Dashboard, Products, etc.) renders here */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Helper for Layout (MUI Box replacement)
import Box from "@mui/material/Box";

export default AdminLayout;
