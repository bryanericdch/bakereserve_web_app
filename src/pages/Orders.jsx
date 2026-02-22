import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../components/HomeHeader";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

// USE THIS FOR LOCAL TESTING:
//const API_URL = "http://localhost:5000/api";
const API_URL = "https://bakereserve-api.onrender.com/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'past'

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  useEffect(() => {
    if (!userInfo.token) {
      navigate("/auth");
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/orders/my-orders`, config);
        setOrders(data);
      } catch {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    const isPast = ["completed", "cancelled", "rejected"].includes(
      order.orderStatus,
    );
    return activeTab === "active" ? !isPast : isPast;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "info";
      case "in_process":
        return "secondary";
      case "ready_for_pickup":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <HomeHeader />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {/* --- TABS --- */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-2 font-bold text-sm transition-colors ${activeTab === "active" ? "text-amber-600 border-b-2 border-amber-600" : "text-gray-500 hover:text-gray-800"}`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-2 font-bold text-sm transition-colors ${activeTab === "past" ? "text-amber-600 border-b-2 border-amber-600" : "text-gray-500 hover:text-gray-800"}`}
          >
            Order History
          </button>
        </div>

        {/* --- ORDER LIST --- */}
        {loading ? (
          <div className="flex justify-center mt-20">
            <CircularProgress />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
            <ShoppingBagOutlinedIcon
              sx={{ fontSize: 60, color: "#ccc", mb: 2 }}
            />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No {activeTab} orders found
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't placed any orders yet.
            </p>
            <Button
              variant="contained"
              onClick={() => navigate("/home")}
              sx={{ backgroundColor: "#ef4444", fontWeight: "bold" }}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-gray-800">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      {order.orderType === "cake" ? (
                        <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold border border-pink-200 uppercase">
                          Cake Order
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold border border-amber-200 uppercase">
                          Bakery
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500 mb-0.5">
                        Total Amount
                      </p>
                      <p className="font-bold text-gray-900">
                        ₱ {order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <Chip
                      label={formatStatus(order.orderStatus)}
                      color={getStatusColor(order.orderStatus)}
                      size="small"
                      sx={{ fontWeight: "bold", borderRadius: "8px" }}
                    />
                  </div>
                </div>

                {/* Order Body: Items & Pickup */}
                <div className="p-6 flex flex-col md:flex-row gap-8">
                  {/* Items List */}
                  <div className="flex-1 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2">
                      Items Ordered
                    </h4>
                    {order.orderItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-start"
                      >
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            <span className="text-gray-500 mr-2">
                              {item.quantity}x
                            </span>
                            {item.name}
                          </p>

                          {/* Display Customizations if Cake */}
                          {item.customization && (
                            <ul className="text-xs text-gray-500 mt-1 pl-6 list-disc">
                              {item.customization.flavor && (
                                <li>Flavor: {item.customization.flavor}</li>
                              )}
                              {item.customization.shape && (
                                <li>Shape: {item.customization.shape}</li>
                              )}
                              {item.customization.message && (
                                <li>Message: "{item.customization.message}"</li>
                              )}
                              {item.customization.tiers &&
                                item.customization.tiers !== "N/A" && (
                                  <li>Tiers: {item.customization.tiers}</li>
                                )}
                            </ul>
                          )}
                        </div>
                        <span className="font-medium text-sm text-gray-600">
                          ₱ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider for mobile */}
                  <Divider className="md:hidden" />

                  {/* Pickup Details */}
                  <div className="w-full md:w-64 bg-amber-50/50 p-4 rounded-xl border border-amber-100 h-fit">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <AccessTimeIcon
                        fontSize="small"
                        className="text-amber-600"
                      />{" "}
                      Pickup Schedule
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-semibold">
                          {new Date(order.pickupDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="font-semibold">
                          {order.pickupTime}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-amber-200/60 mt-2">
                        <span className="text-gray-500">Payment:</span>
                        <span className="font-semibold uppercase">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
