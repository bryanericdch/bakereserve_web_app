import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Button from "@mui/material/Button";

const PaymentStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Optional: Parse URL params to check if PayMongo added a status query
    // e.g., ?payment_intent_id=pi_...
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm w-full">
        <CheckCircleOutlineIcon
          sx={{ fontSize: 80, color: "#22c55e", mb: 2 }}
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Processing
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          Your payment has been submitted. You can track your order status in
          your dashboard.
        </p>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/orders")}
          sx={{ bgcolor: "#slate-900", fontWeight: "bold" }}
        >
          View My Orders
        </Button>
      </div>
    </div>
  );
};

export default PaymentStatus;
