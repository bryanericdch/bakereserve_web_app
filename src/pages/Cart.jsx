import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../components/HomeHeader";

const API_URL = "https://bakereserve-api.onrender.com/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = {
    headers: { Authorization: `Bearer ${userInfo.token}` },
  };

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/cart`, config);
      setCartItems(data.items || []);
    } catch (error) {
      console.error("Error fetching cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo.token) {
      navigate("/auth");
      return;
    }
    fetchCart();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout (Logic coming next!)");
    // navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <HomeHeader />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

        {loading ? (
          <p>Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate("/home")}
              className="text-red-500 font-semibold hover:underline"
            >
              Go to Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center"
                >
                  {/* Product Image (Safety check if product exists) */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      ₱ {item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80 h-fit bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Subtotal</span>
                <span>₱ {calculateTotal()}</span>
              </div>
              <div className="flex justify-between mb-6 font-bold text-xl text-gray-800 border-t pt-4">
                <span>Total</span>
                <span>₱ {calculateTotal()}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
