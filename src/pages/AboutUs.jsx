import React from "react";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";

import landingImage from "../assets/img/landing1.png";

// Icons for the values section
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <HomeHeader />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* --- HERO SECTION --- */}
        <section className="relative w-full h-[30vh] min-h-[300px] mb-12">
          <div className="absolute inset-0">
            <img
              src={landingImage}
              alt="Our Bakery"
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay to make text readable */}
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg tracking-tight">
              Our <span className="text-amber-400">Story</span>
            </h1>
            <p className="text-sm md:text-xl max-w-2xl font-light text-gray-200 drop-shadow-md">
              Baking happiness into every bite, right from our kitchen to your
              table.
            </p>
          </div>
        </section>

        {/* --- OUR STORY SECTION --- */}
        <section className="max-w-4xl mx-auto px-6 py-8 text-center md:text-left">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Welcome to BakeReserve
            </h2>
            <div className="text-gray-600 space-y-5 leading-relaxed text-lg text-justify md:text-center">
              <p>
                What started as a humble home kitchen passion has blossomed into
                a community-favorite bakery. At BakeReserve, we believe that the
                best moments in life are celebrated with something sweet.
              </p>
              <p>
                Our mission is simple: to provide artisanal breads and
                personalized cakes that not only look spectacular but taste
                unforgettable. We source the finest ingredients, skip the
                artificial preservatives, and bake everything fresh daily.
              </p>
              <p>
                Whether you are grabbing a quick morning pastry or designing a
                custom tiered cake for a grand wedding, our team is dedicated to
                crafting a masterpiece tailored just for you.
              </p>
            </div>
          </div>
        </section>

        {/* --- CORE VALUES SECTION --- */}
        <section className="max-w-6xl mx-auto px-6 py-16 mb-10 w-full">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center group hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FavoriteBorderIcon fontSize="large" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Baked with Love
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every dough is kneaded and every frosting is piped with genuine
                passion for the craft of baking.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center group hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <EmojiEventsOutlinedIcon fontSize="large" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Premium Quality
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We never compromise. From real butter to rich chocolates, we use
                only top-tier ingredients.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center group hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <SupportAgentOutlinedIcon fontSize="large" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Customer First
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your satisfaction is our priority. We work closely with you to
                bring your customized cake visions to life.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
