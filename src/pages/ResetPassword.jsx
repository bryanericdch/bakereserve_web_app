import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const API_URL = "https://bakereserve-api.onrender.com/api/auth";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    const strictPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (password.length <= 6 || !strictPasswordRegex.test(password)) {
      return setError(
        "Password must be more than 6 characters, and contain an uppercase letter, lowercase letter, a number, and a special character (!@#$%^&*).",
      );
    }

    setLoading(true);
    try {
      const { data } = await axios.put(`${API_URL}/resetpassword/${token}`, {
        password,
      });
      setSuccess(
        data.message || "Password reset successful! Redirecting to login...",
      );

      // Send them to the login page after 3 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Invalid or expired token. Please request a new link.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#FFFBF7] items-center justify-center p-4">
      <div className="w-full md:w-[450px] bg-[#FEFAF6] rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Set New Password
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your new strong password below.
        </p>

        {error && (
          <Alert severity="error" className="mb-4 text-left text-sm">
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" className="mb-4 text-left text-sm">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <TextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            size="small"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Uppercase, lowercase, number, special char (!@#$)"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
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
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            size="small"
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !!success}
            sx={{
              mt: 2,
              bgcolor: "#111827",
              color: "white",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#374151" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <div className="mt-6 text-sm">
          <button
            onClick={() => navigate("/auth")}
            className="text-amber-600 font-bold hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
