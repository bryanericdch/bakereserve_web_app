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
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

// const API_URL = "http://localhost:5000/api";
const API_URL = "https://bakereserve-api.onrender.com/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [eWalletType, setEWalletType] = useState("gcash"); // 'gcash' or 'paymaya'

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  useEffect(() => {
    if (!userInfo.token) return navigate("/auth");
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
    fetchCart();
  }, [navigate]);

  const handleSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedItems(cartItems.map((item) => item._id));
    else setSelectedItems([]);
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
      const item = cartItems.find((i) => i.product._id === productId);
      if (item) setSelectedItems(selectedItems.filter((id) => id !== item._id));
    } catch {
      console.error("Remove failed");
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item._id))
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0)
      return alert("Please select at least one item.");
    if (!pickupDate || !pickupTime)
      return alert("Please select a pickup date and time.");

    setProcessing(true);
    try {
      // 1. Create the base Orders
      const orderPayload = {
        pickupDate,
        pickupTime,
        paymentMethod,
        selectedItemIds: selectedItems,
      };
      const { data: orderData } = await axios.post(
        `${API_URL}/orders/checkout`,
        orderPayload,
        config,
      );
      const createdOrders = orderData.orders;
      const orderIds = createdOrders.map((o) => o._id);

      // 2. If Cash on Delivery, we are done.
      if (paymentMethod === "cod") {
        alert("Order placed successfully via Cash on Delivery!");
        navigate("/orders");
        return;
      }

      // 3. If E-Wallet, process PayMongo Flow
      if (paymentMethod === "ewallet") {
        // A. Create Intent (Pass Array of IDs)
        const intentRes = await axios.post(
          `${API_URL}/payments/intent`,
          { orderIds },
          config,
        );
        const paymentIntentId = intentRes.data.data.id;

        // B. Create Method (GCash or PayMaya)
        const methodRes = await axios.post(
          `${API_URL}/payments/method`,
          { type: eWalletType },
          config,
        );
        const paymentMethodId = methodRes.data.data.id;

        // C. Attach and Confirm
        const returnUrl = `${window.location.origin}/payment/status`;
        const confirmRes = await axios.post(
          `${API_URL}/payments/confirm`,
          {
            paymentIntentId,
            paymentMethodId,
            returnUrl,
          },
          config,
        );

        // D. Redirect user to PayMongo Auth URL
        const nextAction = confirmRes.data.data.attributes.next_action;
        if (nextAction && nextAction.type === "redirect") {
          window.location.href = nextAction.redirect.url;
        } else {
          // Automatically succeeded (rare for e-wallets, but possible)
          navigate("/payment/status?status=succeeded");
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Checkout failed");
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
              sx={{ backgroundColor: "#ef4444", fontWeight: "bold" }}
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
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
                  className={`bg-white p-4 rounded-xl shadow-sm border transition-all flex items-center gap-3 ${selectedItems.includes(item._id) ? "border-red-200 bg-red-50/10" : "border-gray-100"}`}
                >
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
                    {item.customization?.flavor && (
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

              {/* PAYMENT SELECTION */}
              <div className="mb-6">
                <FormControl component="fieldset">
                  <FormLabel
                    component="legend"
                    className="font-bold text-gray-700 mb-2"
                  >
                    Payment Method
                  </FormLabel>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="cod"
                      control={<Radio size="small" />}
                      label={
                        <span className="text-sm">
                          Cash on Delivery / Pickup
                        </span>
                      }
                    />
                    <FormControlLabel
                      value="ewallet"
                      control={<Radio size="small" />}
                      label={
                        <span className="text-sm">Pay Online (E-Wallet)</span>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {paymentMethod === "ewallet" && (
                  <div className="mt-3 pl-6 border-l-2 border-amber-500 space-y-2">
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Select E-Wallet"
                      value={eWalletType}
                      onChange={(e) => setEWalletType(e.target.value)}
                    >
                      <MenuItem value="gcash">GCash</MenuItem>
                      <MenuItem value="paymaya">PayMaya</MenuItem>
                    </TextField>
                  </div>
                )}
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
                {processing
                  ? "Processing Payment..."
                  : paymentMethod === "ewallet"
                    ? "Pay via PayMongo"
                    : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
