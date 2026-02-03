import { useEffect, useState } from "react";
import Button from "@mui/material/Button";

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      {/* Header */}
      <header
        className={`
          sticky top-0 z-50
          flex items-center justify-between
          px-6 py-4 h-[8vh]
          backdrop-blur-md
          bg-white/10
          border-b border-white/20
          transition-all duration-300
          ${scrolled ? "shadow-lg bg-white/20" : ""}
        `}
      >
        <ul className="flex items-center justify-between w-full">
          <li className="text-white text-[14px] md:text-[24px] hidden sm:block">
            Mon-Fri 6:00 AM — 6:00 PM | Sat-Sun 8:00 AM — 6:00 PM
          </li>
          <li>
            <Button variant="contained" size="large">
              Login
            </Button>
          </li>
        </ul>
      </header>

      {/* Hero */}
      <section className="-mt-[8vh] w-full min-h-screen">
        <img
          src="./src/assets/img/landing1.png"
          className="w-full h-full object-cover"
        />
      </section>
    </div>
  );
}
