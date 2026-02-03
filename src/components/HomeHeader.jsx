import { useNavigate } from "react-router-dom";

const HomeHeader = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFBF7] px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <h1
        className="text-2xl font-bold text-amber-600 cursor-pointer"
        onClick={() => navigate("/home")}
      >
        BakeReserve
      </h1>

      {/* Clean Navigation */}
      <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
        <button
          onClick={() => navigate("/home")}
          className="hover:text-amber-600 transition"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/home")}
          className="hover:text-amber-600 transition"
        >
          Menu
        </button>
        <button className="hover:text-amber-600 transition">My Orders</button>
      </nav>

      {/* Icons */}
      <div className="flex items-center gap-6">
        <button className="hover:text-amber-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>

        <button className="hover:text-amber-600 relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          {/* Cart Badge Placeholder */}
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
            0
          </span>
        </button>

        {/* User Profile / Logout */}
        <div className="flex items-center gap-2 cursor-pointer group relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <span className="text-sm font-semibold hidden sm:block">
            {userInfo.firstName || "User"}
          </span>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-32 bg-white shadow-lg rounded-md hidden group-hover:block border">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
