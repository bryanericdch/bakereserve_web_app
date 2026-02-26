import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Button from "@mui/material/Button";

const API_URL = "https://bakereserve-api.onrender.com/api"; // or localhost:5000

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/auth/verify-email/${token}`,
        );
        setStatus("success");
        setMessage(data.message);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. Token may be invalid or expired.",
        );
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col items-center justify-center px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center max-w-md w-full">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <CircularProgress color="warning" size={60} />
            <h2 className="text-xl font-bold mt-6 text-gray-800">
              Verifying your email...
            </h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircleOutlineIcon
              sx={{ fontSize: 80, color: "#22c55e", mb: 2 }}
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/auth")}
              sx={{
                bgcolor: "#f59e0b",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#d97706" },
              }}
            >
              Proceed to Login
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <ErrorOutlineIcon sx={{ fontSize: 80, color: "#ef4444", mb: 2 }} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => navigate("/auth")}
              sx={{ fontWeight: "bold" }}
            >
              Back to Sign Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
