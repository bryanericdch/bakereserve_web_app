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
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox"; // <--- Import Checkbox

// const API_URL = "http://localhost:5000/api";
const API_URL = "https://bakereserve-api.onrender.com/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Selection State
  const [selectedItems, setSelectedItems] = useState([]); // Array of Item IDs

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

  // Toggle Single Selection
  const handleSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Toggle All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map((item) => item._id));
    } else {
      setSelectedItems([]);
    }
  };

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
      // Remove from selection if it was selected
      const itemInCart = cartItems.find((i) => i.product._id === productId);
      if (itemInCart)
        setSelectedItems(selectedItems.filter((id) => id !== itemInCart._id));
    } catch {
      console.error("Remove failed");
    } finally {
      setProcessing(false);
    }
  };

  // Calculate Total based ONLY on Selected Items
  const calculateTotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item._id))
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }
    if (!pickupDate || !pickupTime) {
      alert("Please select a pickup date and time.");
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        pickupDate,
        pickupTime,
        paymentMethod: "cod",
        selectedItemIds: selectedItems, // <--- Send Selection
      };

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
              }}
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All Header */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Checkbox
                  checked={
                    selectedItems.length === cartItems.length &&
                    cartItems.length > 0
                  }
                  onChange={handleSelectAll}
                  color="error"
                />
                <span className="font-bold text-gray-700">
                  Select All ({cartItems.length} items)
                </span>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white p-4 rounded-xl shadow-sm border transition-all flex items-center gap-4 ${selectedItems.includes(item._id) ? "border-red-200 bg-red-50/10" : "border-gray-100"}`}
                >
                  {/* Item Checkbox */}
                  <Checkbox
                    checked={selectedItems.includes(item._id)}
                    onChange={() => handleSelect(item._id)}
                    color="error"
                  />

                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    {item.customization && item.customization.flavor && (
                      <p className="text-xs text-gray-500">
                        Custom: {item.customization.flavor}
                      </p>
                    )}
                    <p className="text-red-500 font-bold text-sm">
                      ₱ {item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                      <button
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity, -1)
                        }
                        disabled={processing}
                      >
                        -
                      </button>
                      <span className="px-2 font-semibold text-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity, 1)
                        }
                        disabled={processing}
                      >
                        +
                      </button>
                    </div>
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

            {/* RIGHT COLUMN: Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  label="Pickup Date"
                  InputLabelProps={{ shrink: true }}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Pickup Time"
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

              <Divider className="mb-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-700">
                  Total ({selectedItems.length} items)
                </span>
                <span className="text-red-500 font-bold text-xl">
                  ₱ {calculateTotal().toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing || selectedItems.length === 0}
                className={`w-full py-3 rounded-lg font-bold transition mb-3 shadow-md ${selectedItems.length === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
              >
                {processing ? "Processing..." : "Checkout Selected"}
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
