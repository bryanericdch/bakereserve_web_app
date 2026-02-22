import { useNavigate } from "react-router-dom";
import HomeHeader from "../components/HomeHeader";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

const Profile = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/auth");
  };

  // If somehow accessed without logging in, redirect
  if (!userInfo.token) {
    navigate("/auth");
    return null;
  }

  // Get user initials for the avatar
  const initials =
    `${userInfo.firstName?.charAt(0) || ""}${userInfo.lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <HomeHeader />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">
          My Profile
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Area */}
          <div className="bg-amber-50 px-8 py-10 flex flex-col items-center border-b border-amber-100">
            <div className="w-24 h-24 bg-amber-500 text-white rounded-full flex items-center justify-center text-3xl font-black shadow-md mb-4">
              {initials}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {userInfo.firstName} {userInfo.lastName}
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-200/50 px-3 py-1 rounded-full mt-2">
              {userInfo.role || "Customer"}
            </span>
          </div>

          {/* User Details */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <PersonOutlineIcon fontSize="small" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Full Name</p>
                <p className="text-gray-800 font-bold">
                  {userInfo.firstName} {userInfo.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <EmailOutlinedIcon fontSize="small" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Email Address
                </p>
                <p className="text-gray-800 font-bold">{userInfo.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <PhoneOutlinedIcon fontSize="small" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Contact Number
                </p>
                <p className="text-gray-800 font-bold">
                  {userInfo.contactNumber || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-4 border-t border-gray-100">
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-colors"
            >
              <ShoppingBagOutlinedIcon fontSize="small" /> View My Orders
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 py-3 rounded-xl font-bold transition-colors"
            >
              <LogoutIcon fontSize="small" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
