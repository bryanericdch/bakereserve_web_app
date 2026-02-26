import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";

const API_URL = "https://bakereserve-api.onrender.com/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await axios.post(`${API_URL}/auth/forgotpassword`, {
        email,
      });
      setMessage({ type: "success", text: data.message });
      setEmail(""); // clear
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to send email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#FFFBF7] items-center justify-center p-4">
      <div className="absolute top-4 left-4 z-10">
        <IconButton
          onClick={() => navigate("/auth")}
          sx={{ bgcolor: "white", boxShadow: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {message.text && (
          <Alert severity={message.type} className="mb-4 text-left">
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Email Address"
            type="email"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#f59e0b",
              "&:hover": { bgcolor: "#d97706" },
              py: 1.5,
              fontWeight: "bold",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
export default ForgotPassword;
