import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";

const API_URL = "https://bakereserve-api.onrender.com/api";

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo") || "{}"),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password Modal States
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [formData, setFormData] = useState({
    firstName: userInfo.firstName || "",
    lastName: userInfo.lastName || "",
    contactNumber: userInfo.contactNumber || "",
    address: userInfo.address || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
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
  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(
        `${API_URL}/users/profile`,
        formData,
        config,
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUserInfo(data);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      return setPasswordError("All fields are required.");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError("New passwords do not match.");
    }

    const strictPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (
      !strictPasswordRegex.test(passwordData.newPassword) ||
      passwordData.newPassword.length <= 6
    ) {
      return setPasswordError(
        "New password must be > 6 chars, contain uppercase, lowercase, number, and special character.",
      );
    }

    setPasswordLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(
        `${API_URL}/users/profile`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        config,
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUserInfo(data);
      setPasswordModalOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage({ type: "success", text: "Password changed successfully!" });
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setPasswordLoading(false);
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
            onClick={() => {
              setIsEditing(!isEditing);
              setMessage({ type: "", text: "" });
            }}
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
        {userInfo.accountStatus === "warned" && (
          <Alert severity="warning" className="mb-6 font-medium">
            <strong>⚠ Account Warning:</strong>{" "}
            {userInfo.warningMessage ||
              "Your account has received a warning due to policy violations."}
          </Alert>
        )}

        {message.text && (
          <Alert severity={message.type} className="mb-4">
            {message.text}
          </Alert>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-amber-50 px-8 py-10 flex flex-col items-center border-b border-amber-100 relative">
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
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) handleChange(e);
                    }}
                    InputProps={{ inputProps: { maxLength: 10 } }}
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
          </div>

          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-4 border-t border-gray-100">
            {isEditing ? (
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors shadow-md"
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    <SaveIcon fontSize="small" /> Save Profile
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  <LockOutlinedIcon fontSize="small" /> Change Password
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

      {/* CHANGE PASSWORD MODAL */}
      <Dialog
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center font-bold border-b pb-3">
          Change Password
          <IconButton onClick={() => setPasswordModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="pt-5 space-y-4">
          {passwordError && <Alert severity="error">{passwordError}</Alert>}
          <TextField
            size="small"
            fullWidth
            label="Current Password"
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
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
          <TextField
            size="small"
            fullWidth
            label="New Password"
            name="newPassword"
            type={showNew ? "text" : "password"}
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            helperText="Uppercase, lowercase, number, and special char required."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNew(!showNew)} size="small">
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
            label="Confirm New Password"
            name="confirmPassword"
            type={showNew ? "text" : "password"}
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #f3f4f6" }}>
          <Button
            onClick={() => setPasswordModalOpen(false)}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePassword}
            variant="contained"
            disabled={passwordLoading}
            sx={{ bgcolor: "#111827", fontWeight: "bold" }}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default Profile;
