import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../components/HomeHeader";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button"; // Added Button import

const API_URL = "https://bakereserve-api.onrender.com/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/cart`, config);
      setCartItems(data.items || []);
    } catch {
      console.error("Error fetching cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo.token) return navigate("/auth");
    fetchCart();
  }, []);

  const updateQuantity = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    setProcessing(true);
    try {
      const { data } = await axios.put(
        `${API_URL}/cart/${productId}`,
        { quantity: newQty },
        config,
      );
      setCartItems(data.items);
    } catch {
      console.error("Update failed");
    } finally {
      setProcessing(false);
    }
  };

  const removeItem = async (productId) => {
    if (!window.confirm("Remove this item?")) return;
    setProcessing(true);
    try {
      const { data } = await axios.delete(
        `${API_URL}/cart/${productId}`,
        config,
      );
      setCartItems(data.items);
    } catch {
      console.error("Remove failed");
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!pickupDate || !pickupTime) {
      alert("Please select a pickup date and time.");
      return;
    }

    try {
      setProcessing(true);
      const payload = { pickupDate, pickupTime, paymentMethod: "cod" };
      await axios.post(`${API_URL}/orders/checkout`, payload, config);
      alert("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      alert(error.response?.data?.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <HomeHeader />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center mt-20">
            <CircularProgress />
          </div>
        ) : cartItems.length === 0 ? (
          // --- NEW EMPTY CART DESIGN ---
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Your cart is empty
            </h2>
            <Button
              variant="contained"
              onClick={() => navigate("/home")}
              sx={{
                backgroundColor: "#ef4444",
                padding: "10px 32px",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
                borderRadius: "8px",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#dc2626", boxShadow: "none" },
              }}
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-red-500 font-bold text-sm">
                        ₱ {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity, -1)
                        }
                        disabled={processing}
                      >
                        {" "}
                        -{" "}
                      </button>
                      <span className="px-3 font-semibold text-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity, 1)
                        }
                        disabled={processing}
                      >
                        {" "}
                        +{" "}
                      </button>
                    </div>

                    <p className="font-bold text-gray-800 hidden sm:block">
                      ₱ {(item.price * item.quantity).toFixed(2)}
                    </p>

                    <IconButton
                      size="small"
                      onClick={() => removeItem(item.product._id)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: Pickup Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Pickup Details
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">
                    Pickup date
                  </label>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">
                    Pickup time
                  </label>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Select Time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  >
                    <MenuItem value="08:00 AM">08:00 AM</MenuItem>
                    <MenuItem value="10:00 AM">10:00 AM</MenuItem>
                    <MenuItem value="01:00 PM">01:00 PM</MenuItem>
                    <MenuItem value="03:00 PM">03:00 PM</MenuItem>
                    <MenuItem value="05:00 PM">05:00 PM</MenuItem>
                  </TextField>
                </div>
              </div>
              <Divider className="mb-4" />
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-700">Total</span>
                <span className="text-red-500 font-bold text-xl">
                  ₱ {calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition mb-3 shadow-md"
              >
                {processing ? "Processing..." : "Proceed to Checkout"}
              </button>
              <button
                onClick={() => navigate("/home")}
                className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
