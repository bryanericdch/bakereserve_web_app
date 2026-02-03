import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

// Ensure this matches your live backend or localhost
const API_URL = "https://bakereserve-api.onrender.com/api/auth";

const countryCodes = [
  { code: "+63", label: "PH (+63)" },
  { code: "+1", label: "US (+1)" },
  { code: "+44", label: "UK (+44)" },
];

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, SFLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Data
  const [countryCode, setCountryCode] = useState("+63");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // --- COMMON CHECKS ---
    // 1. Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // 2. Password Not Empty
    if (!formData.password) {
      setError("Please enter your password.");
      return false;
    }

    // --- STRICT CHECKS FOR SIGNUP ONLY ---
    if (!isLogin) {
      // Name Length (> 1 character means length >= 2)
      if (formData.firstName.trim().length < 2) {
        setError("First Name must be at least 2 characters.");
        return false;
      }
      if (formData.lastName.trim().length < 2) {
        setError("Last Name must be at least 2 characters.");
        return false;
      }

      // Contact Number (Only Numbers)
      const numberRegex = /^\d+$/;
      if (!numberRegex.test(formData.contactNumber)) {
        setError("Contact number should only contain numbers.");
        return false;
      }

      // Password Complexity (>6 chars, alphanumeric, special char)
      if (formData.password.length <= 6) {
        setError("Password must be more than 6 characters.");
        return false;
      }

      // Regex: Letters + Numbers + Special Characters
      const strictPasswordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
      if (!strictPasswordRegex.test(formData.password)) {
        setError(
          "Password must contain letters, numbers, and special characters (!@#$%^&*).",
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    SFLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data } = await axios.post(`${API_URL}/login`, {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("userInfo", JSON.stringify(data));

        if (data.role === "admin") {
          alert("Admin Login Successful");
        } else {
          navigate("/home");
        }
      } else {
        // --- REGISTER ---
        const fullContactNumber = `${countryCode}${formData.contactNumber}`;

        const { data } = await axios.post(`${API_URL}/register`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          contactNumber: fullContactNumber,
          password: formData.password,
        });

        localStorage.setItem("userInfo", JSON.stringify(data));
        navigate("/home");
      }
    } catch (err) {
      console.error(err);
      // Backend now sends "Email not found" or "Password is incorrect"
      setError(
        err.response?.data?.message || "Server error. Please try again.",
      );
    } finally {
      SFLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#FFFBF7] items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl items-center justify-between gap-10">
        {/* Branding */}
        <div className="text-center md:text-left md:w-1/2 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            <span className="text-amber-600">BakeReserve.</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed">
            Handcrafted cakes, breads, and pastries baked fresh daily for your
            special moments and sweet cravings.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full md:w-[450px] bg-[#FEFAF6] rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Tabs */}
          <div className="flex w-full bg-gray-200 rounded-lg p-1 mb-6">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                isLogin
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:text-black"
              }`}
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                !isLogin
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:text-black"
              }`}
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <Alert severity="error" className="mb-4 text-sm">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {!isLogin && (
              <div className="flex gap-2">
                <TextField
                  label="First Name"
                  name="firstName"
                  size="small"
                  fullWidth
                  required
                  onChange={handleChange}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  size="small"
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </div>
            )}

            <TextField
              label="Email"
              name="email"
              type="email"
              size="small"
              fullWidth
              required
              onChange={handleChange}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              size="small"
              fullWidth
              required
              onChange={handleChange}
              helperText={!isLogin ? "Must include special char (!@#$)" : ""}
            />

            {!isLogin && (
              <div className="flex gap-2">
                <Select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  size="small"
                  sx={{ width: "110px" }}
                >
                  {countryCodes.map((option) => (
                    <MenuItem key={option.code} value={option.code}>
                      {option.code}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  label="Contact Number"
                  name="contactNumber"
                  type="tel"
                  size="small"
                  fullWidth
                  required
                  onChange={handleChange}
                  placeholder="9123456789"
                />
              </div>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                bgcolor: "#f5f5f5",
                color: "black",
                fontWeight: "bold",
                border: "1px solid #e5e5e5",
                "&:hover": { bgcolor: "#e5e5e5" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isLogin ? (
                "Login"
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
