import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ProductDetailModal from "../components/ProductDetailModal";
import QuickAddModal from "../components/QuickAddModal";

import VisibilityIcon from "@mui/icons-material/Visibility";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import EditIcon from "@mui/icons-material/Edit";
import CakeIcon from "@mui/icons-material/Cake";
import CloseIcon from "@mui/icons-material/Close";

import landingImage from "../assets/img/landing1.png";

// const API_URL = "http://localhost:5000/api";
const API_URL = "https://bakereserve-api.onrender.com/api";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Extract search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  // Modals
  const [detailProduct, setDetailProduct] = useState(null);
  const [quickAddProduct, setQuickAddProduct] = useState(null);

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

  const handlePersonalize = (product) => navigate(`/product/${product._id}`);

  const handleQuickAdd = async (product, qty) => {
    if (!userInfo.token)
      return setAlert({
        open: true,
        message: "Please login to order",
        severity: "error",
      });
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

  const clearSearch = () => {
    navigate("/home");
  };

  // --- FILTERING LOGIC ---
  const filteredProducts = products.filter((p) => {
    // 1. Category Filter
    const matchCategory = filter === "all" ? true : p.category === filter;

    // 2. Search Query Filter
    const matchSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.flavor && p.flavor.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
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

      {/* HERO SECTION */}
      <section className="relative w-full h-[40vh] md:h-[50vh] min-h-[400px] mb-12">
        <div className="absolute inset-0">
          <img
            src={landingImage}
            alt="Bakery Display"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
            Welcome to <span className="text-amber-400">BakeReserve</span>
          </h1>
          <p className="text-md md:text-xl max-w-2xl font-light drop-shadow-md mb-8">
            Freshly baked goods and customized cakes reserved just for you.
          </p>

          <button
            onClick={() => navigate("/create-cake")}
            className="flex items-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-amber-600 transition-transform shadow-xl active:scale-95"
          >
            <CakeIcon fontSize="small" /> Create Your Own Cake
          </button>
        </div>
      </section>

      {/* MENU FILTERS */}
      <div
        id="menu-section"
        className="flex justify-center mb-6 px-4 pt-4 scroll-mt-24"
      >
        <div className="bg-white p-1.5 rounded-full inline-flex shadow-sm border border-gray-200">
          {["All products", "Breads", "Cakes"].map((label) => {
            let value = "all";
            if (label === "Breads") value = "bakery";
            if (label === "Cakes") value = "cake";
            return (
              <button
                key={label}
                onClick={() => setFilter(value)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${filter === value ? "bg-amber-500 shadow-md text-white" : "text-gray-500 hover:text-gray-900"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH BANNER */}
      {searchQuery && (
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-center mb-8">
          <div className="bg-amber-100 border border-amber-200 text-amber-800 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-3 shadow-sm">
            <span>Showing results for: "{searchQuery}"</span>
            <button
              onClick={clearSearch}
              className="bg-amber-200 hover:bg-amber-300 rounded-full p-0.5 transition-colors"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24 flex-1 w-full">
        {loading ? (
          <div className="flex justify-center mt-10">
            <CircularProgress sx={{ color: "#f59e0b" }} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
            <p className="text-gray-500 font-medium text-lg">
              No products found matching your criteria.
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-4 text-amber-600 font-bold hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group"
              >
                <div
                  className="h-56 w-full bg-gray-100 relative cursor-pointer overflow-hidden"
                  onClick={() =>
                    product.category === "cake"
                      ? setDetailProduct(product)
                      : setQuickAddProduct(product)
                  }
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.countInStock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold border-2 border-white px-4 py-1.5 uppercase tracking-widest text-sm rounded-md">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    {product.category === "cake" && (
                      <span className="text-[10px] uppercase font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200">
                        Cake
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* --- UPDATED PRICE & STOCK DISPLAY --- */}
                  <div className="mt-auto flex items-center justify-between mb-5">
                    <div>
                      <span className="text-amber-600 font-bold text-xl">
                        ₱ {product.price}
                      </span>
                      {product.category === "bakery" && (
                        <span className="text-[10px] text-gray-500 block">
                          / pack of {product.piecesPerPack || 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${product.countInStock > 0 ? "text-green-600 bg-green-50 px-2 py-1 rounded" : "text-red-500 bg-red-50 px-2 py-1 rounded"}`}
                    >
                      {product.countInStock > 0
                        ? `${product.countInStock} Available`
                        : "Out of Stock"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {product.category === "cake" ? (
                      <>
                        <button
                          onClick={() => setDetailProduct(product)}
                          className="flex-1 bg-gray-50 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200"
                        >
                          <VisibilityIcon fontSize="small" /> Details
                        </button>
                        <button
                          onClick={() => handlePersonalize(product)}
                          disabled={product.countInStock === 0}
                          className={`flex-1 ${product.countInStock > 0 ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"} font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all`}
                        >
                          <EditIcon fontSize="small" /> Personalize
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="flex-1 bg-gray-50 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200"
                        >
                          <VisibilityIcon fontSize="small" /> Details
                        </button>
                        <button
                          onClick={() => setQuickAddProduct(product)}
                          disabled={product.countInStock === 0}
                          className={`flex-1 ${product.countInStock > 0 ? "bg-slate-900 hover:bg-slate-800 text-white shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"} font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all`}
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

      <Footer />
    </div>
  );
};

export default Home;
