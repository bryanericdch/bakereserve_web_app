import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import LandingHeader from "../components/LandingHeader";
import landingImage from "../assets/img/landing1.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen bg-gray-50">
      {/* 1. Reusable Header */}
      <LandingHeader />

      {/* 2. Hero Section */}
      <section className="relative w-full h-screen">
        {/* Background Image container */}
        <div className="absolute inset-0">
          <img
            src={landingImage}
            alt="Bakery Display"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay - makes text readable */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content - Centered */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg leading-tight">
            Reserve the <span className="text-amber-400">Sweetness</span>
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-2xl font-light drop-shadow-md">
            Skip the line. Pre-order your favorite freshly baked breads and
            cakes today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/products")}
              sx={{
                backgroundColor: "#f59e0b", // Amber-500
                padding: "12px 36px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#d97706" },
              }}
            >
              View Menu
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/auth")}
              sx={{
                color: "white",
                borderColor: "white",
                padding: "12px 36px",
                fontSize: "1.1rem",
                borderWidth: "2px",
                "&:hover": {
                  borderWidth: "2px",
                  borderColor: "#f59e0b",
                  color: "#f59e0b",
                },
              }}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Simple Feature Section (Placeholder for now) */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Why BakeReserve?
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          We ensure your cravings are satisfied without the wait. Browse our
          catalog, customize your cake, and pick it up fresh.
        </p>
      </section>
    </div>
  );
}
