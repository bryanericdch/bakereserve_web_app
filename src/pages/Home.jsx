import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ProductDetailModal from "../components/ProductDetailModal";
import QuickAddModal from "../components/QuickAddModal";

import VisibilityIcon from "@mui/icons-material/Visibility";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import EditIcon from "@mui/icons-material/Edit";

// const API_URL = "http://localhost:5000/api";
const API_URL = "https://bakereserve-api.onrender.com/api";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modals
  const [detailProduct, setDetailProduct] = useState(null); // For Cakes Detail View
  const [quickAddProduct, setQuickAddProduct] = useState(null); // For Bakery Quick Add

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

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

  // --- ACTIONS ---
  const handlePersonalize = (product) => {
    navigate(`/product/${product._id}`);
  };

  const handleQuickAdd = async (product, qty) => {
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
        { productId: product._id, quantity: qty },
        config,
      );
      setAlert({
        open: true,
        message: `Added ${qty} ${product.name} to cart!`,
        severity: "success",
      });
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
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${filter === value ? "bg-white shadow-sm text-black" : "text-gray-600 hover:text-black"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="flex justify-center mt-10">
            <CircularProgress />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group"
              >
                {/* Image Area */}
                <div
                  className="h-48 w-full bg-gray-100 relative cursor-pointer"
                  onClick={() =>
                    product.category === "cake"
                      ? setDetailProduct(product)
                      : setQuickAddProduct(product)
                  }
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.countInStock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold border-2 border-white px-3 py-1 uppercase tracking-wider">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                      {product.name}
                    </h3>
                    {product.category === "cake" && (
                      <span className="text-[10px] uppercase font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded">
                        Cake
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between mb-4">
                    <span className="text-red-500 font-bold text-lg">
                      ₱ {product.price}
                    </span>
                    <span
                      className={`text-xs ${product.countInStock > 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {product.countInStock > 0 ? "Available" : "Out of Stock"}
                    </span>
                  </div>

                  {/* BUTTONS LOGIC */}
                  <div className="flex gap-2">
                    {product.category === "cake" ? (
                      <>
                        {/* CAKE: View Details & Personalize */}
                        <button
                          onClick={() => setDetailProduct(product)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <VisibilityIcon fontSize="small" /> Details
                        </button>
                        <button
                          onClick={() => handlePersonalize(product)}
                          disabled={product.countInStock === 0}
                          className={`flex-1 ${product.countInStock > 0 ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"} font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors`}
                        >
                          <EditIcon fontSize="small" /> Personalize
                        </button>
                      </>
                    ) : (
                      <>
                        {/* BAKERY: View Details & Quick Add */}
                        <button
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <VisibilityIcon fontSize="small" /> Details
                        </button>
                        <button
                          onClick={() => setQuickAddProduct(product)}
                          disabled={product.countInStock === 0}
                          className={`flex-1 ${product.countInStock > 0 ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"} font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors`}
                        >
                          <AddShoppingCartIcon fontSize="small" /> Add
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductDetailModal
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
        onPersonalize={handlePersonalize}
      />

      <QuickAddModal
        open={!!quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
        product={quickAddProduct}
        onConfirm={handleQuickAdd}
      />
    </div>
  );
};

export default Home;
