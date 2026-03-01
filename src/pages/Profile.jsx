import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const API_URL = "https://bakereserve-api.onrender.com/api";

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo") || "{}"),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password Visibility States
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [formData, setFormData] = useState({
    firstName: userInfo.firstName || "",
    lastName: userInfo.lastName || "",
    contactNumber: userInfo.contactNumber || "",
    address: userInfo.address || "", // NEW FIELD
    currentPassword: "", // NEW PASSWORD FLOW
    newPassword: "",
    confirmPassword: "",
  });

  if (!userInfo.token) {
    navigate("/auth");
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/auth");
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Local Validation for Passwords
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setLoading(false);
        return setMessage({
          type: "error",
          text: "You must enter your current password to change it.",
        });
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setLoading(false);
        return setMessage({
          type: "error",
          text: "New passwords do not match.",
        });
      }
    }

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
        address: formData.address,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const { data } = await axios.put(
        `${API_URL}/users/profile`,
        payload,
        config,
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUserInfo(data);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const initials =
    `${userInfo.firstName?.charAt(0) || ""}${userInfo.lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <HomeHeader />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-full transition-colors"
          >
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <EditIcon fontSize="small" /> Edit Profile
              </>
            )}
          </button>
        </div>

        {message.text && (
          <Alert severity={message.type} className="mb-4">
            {message.text}
          </Alert>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-amber-50 px-8 py-10 flex flex-col items-center border-b border-amber-100 relative">
            {/* Alert Badge if Address is Missing */}
            {!userInfo.address && !isEditing && (
              <div className="absolute top-4 w-full text-center">
                <span className="bg-red-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                  ⚠ Please complete your profile address
                </span>
              </div>
            )}
            <div className="w-24 h-24 bg-amber-500 text-white rounded-full flex items-center justify-center text-3xl font-black shadow-md mb-4 mt-2">
              {initials}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {userInfo.firstName} {userInfo.lastName}
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-200/50 px-3 py-1 rounded-full mt-2">
              {userInfo.role || "Customer"}
            </span>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 opacity-70">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <EmailOutlinedIcon fontSize="small" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Email Address (Cannot be changed)
                </p>
                <p className="text-gray-800 font-bold">{userInfo.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <PersonOutlineIcon fontSize="small" />
              </div>
              <div className="flex-1 flex gap-4">
                {isEditing ? (
                  <>
                    <TextField
                      size="small"
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Full Name
                    </p>
                    <p className="text-gray-800 font-bold">
                      {userInfo.firstName} {userInfo.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <PhoneOutlinedIcon fontSize="small" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <TextField
                    size="small"
                    fullWidth
                    label="Contact Number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Contact Number
                    </p>
                    <p className="text-gray-800 font-bold">
                      {userInfo.contactNumber || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* --- NEW: ADDRESS FIELD --- */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <HomeOutlinedIcon fontSize="small" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <TextField
                    size="small"
                    fullWidth
                    label="Delivery / Home Address"
                    name="address"
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 123 Main St, Brgy. San Juan, City"
                  />
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Address</p>
                    <p
                      className={`font-bold ${userInfo.address ? "text-gray-800" : "text-red-500"}`}
                    >
                      {userInfo.address || "Not provided"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* --- NEW PASSWORD FLOW --- */}
            {isEditing && (
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <p className="text-sm text-gray-800 font-bold">
                  Change Password (Optional)
                </p>
                <p className="text-xs text-gray-500">
                  Leave these blank if you do not want to change your password.
                </p>
                <TextField
                  size="small"
                  fullWidth
                  type={showCurrent ? "text" : "password"}
                  label="Current Password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrent(!showCurrent)}
                          size="small"
                        >
                          {showCurrent ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <div className="flex gap-4">
                  <TextField
                    size="small"
                    fullWidth
                    type={showNew ? "text" : "password"}
                    label="New Password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNew(!showNew)}
                            size="small"
                          >
                            {showNew ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    type={showNew ? "text" : "password"}
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-4 border-t border-gray-100">
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors shadow-md"
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    <SaveIcon fontSize="small" /> Save Changes
                  </>
                )}
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
