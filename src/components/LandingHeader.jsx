import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

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

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-8 items-center font-medium">
        <button
          onClick={() => navigate("/")}
          className="hover:text-amber-500 transition-colors"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/products")}
          className="hover:text-amber-500 transition-colors"
        >
          Menu
        </button>
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
            borderColor: scrolled ? "" : "white",
            backgroundColor: scrolled ? "#1f2937" : "transparent", // dark gray when scrolled
            "&:hover": {
              backgroundColor: scrolled ? "#111827" : "rgba(255,255,255,0.1)",
              borderColor: "white",
            },
          }}
        >
          Login
        </Button>
      </div>
    </header>
  );
};

export default LandingHeader;
