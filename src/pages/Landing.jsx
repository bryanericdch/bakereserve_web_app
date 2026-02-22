import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import LandingHeader from "../components/LandingHeader";
import Footer from "../components/Footer"; // <-- Import the new Footer
import landingImage from "../assets/img/landing1.png";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo) {
      if (userInfo.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    }
  }, [navigate]);

  // Placeholder images for the carousels
  const cakeImages = [
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    "https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400&q=80",
    "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&q=80",
    "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&q=80",
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80",
  ];

  const breadImages = [
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&q=80",
    "https://images.unsplash.com/photo-1589367920969-18b69188a1e1?w=400&q=80",
    "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80",
    "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
  ];

  return (
    <div className="relative w-full min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Inline CSS for the continuous marquee animation */}
      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee-left {
            display: flex;
            width: max-content;
            animation: scroll-left 30s linear infinite;
          }
          .animate-marquee-right {
            display: flex;
            width: max-content;
            animation: scroll-right 30s linear infinite;
          }
          .animate-marquee-left:hover, .animate-marquee-right:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* 1. Reusable Header */}
      <LandingHeader />

      {/* 2. Hero Section (Retained your original design) */}
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

      {/* 3. Simple Feature Section */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Why BakeReserve?
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          We ensure your cravings are satisfied without the wait. Browse our
          catalog, customize your cake, and pick it up fresh.
        </p>
      </section>

      {/* 4. Cake Carousel (Circles scrolling left) */}
      <section className="w-full py-10 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          Our Signature Cakes
        </h2>
        <div className="w-[100vw] relative left-1/2 -translate-x-1/2 overflow-hidden py-4">
          {/* Duplicated array for seamless loop */}
          <div className="animate-marquee-left gap-8 px-4">
            {[...cakeImages, ...cakeImages].map((img, idx) => (
              <div
                key={idx}
                className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden flex-shrink-0 shadow-lg border-4 border-white group cursor-pointer"
              >
                <img
                  src={img}
                  alt={`Cake ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Bread Carousel (Squares scrolling right) */}
      <section className="w-full py-10 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          Freshly Baked Breads
        </h2>
        <div className="w-[100vw] relative left-1/2 -translate-x-1/2 overflow-hidden py-4">
          {/* Scrolling right this time for variety */}
          <div className="animate-marquee-right gap-6 px-4">
            {[...breadImages, ...breadImages].map((img, idx) => (
              <div
                key={idx}
                className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden flex-shrink-0 shadow-md border-2 border-white group cursor-pointer"
              >
                <img
                  src={img}
                  alt={`Bread ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
