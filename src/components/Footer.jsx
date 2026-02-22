import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tighter mb-4">
              Bake<span className="text-amber-500">Reserve</span>.
            </h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto md:mx-0">
              Freshly baked goods and customized cakes reserved just for you.
              Quality in every bite.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-bold text-gray-800">Quick Links</h3>
            <Link
              to="/home"
              className="text-sm text-gray-500 hover:text-amber-500 transition"
            >
              Our Menu
            </Link>
            <Link
              to="/create-cake"
              className="text-sm text-gray-500 hover:text-amber-500 transition"
            >
              Create Your Cake
            </Link>
            <Link
              to="/auth"
              className="text-sm text-gray-500 hover:text-amber-500 transition"
            >
              Login / Register
            </Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-bold text-gray-800">Contact Us</h3>
            <p className="text-sm text-gray-500">
              📍 Dagupan City, Philippines
            </p>
            <p className="text-sm text-gray-500">📞 +63 912 345 6789</p>
            <p className="text-sm text-gray-500">✉️ hello@bakereserve.com</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} BakeReserve. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
