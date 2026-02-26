import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const LandingHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 z-50 w-full
        flex items-center justify-between
        px-6 py-3 md:px-12 md:py-4
        transition-all duration-300
        ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md text-gray-800" : "bg-transparent text-white"}
      `}
    >
      {/* Brand Logo */}
      <div
        className="text-2xl font-bold tracking-wider cursor-pointer"
        onClick={() => navigate("/")}
      >
        BakeReserve
      </div>

      {/* Desktop Navigation - Replaced with Shop Schedule */}
      <nav className="hidden md:flex items-center gap-2 font-medium text-sm">
        <AccessTimeIcon
          fontSize="small"
          className={scrolled ? "text-amber-600" : "text-amber-400"}
        />
        <span>Open Mon - Sat | 8:00 AM - 6:00 PM</span>
      </nav>

      {/* Login Button */}
      <div>
        <Button
          variant={scrolled ? "contained" : "outlined"}
          color={scrolled ? "primary" : "inherit"}
          onClick={() => navigate("/auth")}
          sx={{
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: "bold",
            borderColor: scrolled ? "" : "white",
            backgroundColor: scrolled ? "#1f2937" : "transparent", // dark gray when scrolled
            "&:hover": {
              backgroundColor: scrolled ? "#111827" : "rgba(255,255,255,0.1)",
              borderColor: "white",
            },
          }}
        >
          Login | Sign Up
        </Button>
      </div>
    </header>
  );
};

export default LandingHeader;
