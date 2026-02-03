import { useEffect, useState } from "react";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const API_URL = "https://bakereserve-api.onrender.com/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Feedback state
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get Token helper
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = {
    headers: { Authorization: `Bearer ${userInfo.token}` },
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products`);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (product) => {
    if (!userInfo.token) {
      setAlert({
        open: true,
        message: "Please login to order",
        severity: "error",
      });
      return;
    }

    try {
      await axios.post(
        `${API_URL}/cart`,
        {
          productId: product._id,
          quantity: 1,
          // Optional: customization if needed later
        },
        config,
      );

      setAlert({ open: true, message: "Added to cart!", severity: "success" });
    } catch {
      setAlert({
        open: true,
        message: "Failed to add to cart",
        severity: "error",
      });
    }
  };

  const filteredProducts = products.filter((p) =>
    filter === "all" ? true : p.category === filter,
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <HomeHeader />

      {/* Snackbar for Notifications */}
      <Snackbar
        open={alert.open}
        autoHideDuration={2000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alert.severity} variant="filled">
          {alert.message}
        </Alert>
      </Snackbar>

      <div className="py-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-red-500">
          BakeReserve
        </h1>
      </div>

      <div className="flex justify-center mb-10 px-4">
        <div className="bg-gray-200 p-1 rounded-full inline-flex">
          {["All products", "Breads", "Cakes"].map((label) => {
            let value = "all";
            if (label === "Breads") value = "bakery";
            if (label === "Cakes") value = "cake";

            return (
              <button
                key={label}
                onClick={() => setFilter(value)}
                className={`
                  px-6 py-2 rounded-full text-sm font-semibold transition-all
                  ${filter === value ? "bg-white shadow-sm text-black" : "text-gray-600 hover:text-black"}
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-48 w-full bg-gray-100 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between mb-4">
                    <span className="text-red-500 font-bold text-lg">
                      ₱ {product.price}
                    </span>
                    <span className="text-xs text-gray-400">Available</span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors active:scale-95 transform"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
