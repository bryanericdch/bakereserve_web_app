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

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import EditIcon from "@mui/icons-material/Edit";
import CakeIcon from "@mui/icons-material/Cake";
import CloseIcon from "@mui/icons-material/Close";

import landingImage from "../assets/img/landing1.png";

const API_URL = "https://bakereserve-api.onrender.com/api";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

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
        message: "Please login to reserve",
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
        message: `Reserved ${qty} ${product.name}!`,
        severity: "success",
      });
    } catch {
      setAlert({
        open: true,
        message: "Failed to reserve item",
        severity: "error",
      });
    }
  };

  const clearSearch = () => navigate("/home");

  const filteredProducts = products.filter((p) => {
    const matchCategory = filter === "all" ? true : p.category === filter;
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

      <div
        id="menu-section"
        className="flex justify-center mb-6 px-4 pt-4 scroll-mt-24"
      >
        <div className="bg-white p-1.5 rounded-full inline-flex shadow-sm border border-gray-200 px-[25px]">
          {["All products", "Breads", "Cakes"].map((label) => {
            let value = "all";
            if (label === "Breads") value = "bakery";
            if (label === "Cakes") value = "cake";
            return (
              <button
                key={label}
                onClick={() => setFilter(value)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${filter === value ? " bg-amber-500 shadow-md text-white rounded" : "text-gray-500 hover:text-gray-900"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

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
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group"
              >
                {/* --- UPDATED: Click image to open details for ALL products --- */}
                <div
                  className="h-56 w-full bg-gray-100 relative cursor-pointer overflow-hidden"
                  onClick={() => setDetailProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.countInStock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold border-2 border-white px-4 py-1.5 uppercase tracking-widest text-sm rounded-md">
                        Fully Booked
                      </span>
                    </div>
                  )}
                  {/* Subtle hover overlay to indicate it's clickable */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      View Details
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    {/* --- UPDATED: Text size and line-clamp so long names fit perfectly --- */}
                    <h4 className="font-bold text-base leading-tight text-gray-900 line-clamp-2">
                      {product.name}
                    </h4>

                    {product.category === "cake" && (
                      <span className="text-[10px] uppercase font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200 whitespace-nowrap h-fit">
                        Cake
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between mb-5">
                    <div>
                      <span className="text-red-500 font-bold text-xl">
                        ₱ {product.price}
                      </span>
                      {product.category === "bakery" && (
                        <span className="text-[10px] text-gray-500 block">
                          / pack of {product.piecesPerPack || 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold ${product.countInStock > 0 ? "text-green-700 bg-green-100 px-2 py-1 rounded-md border border-green-200" : "text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200"}`}
                    >
                      {product.countInStock > 0
                        ? `${product.countInStock} Slots Left`
                        : "Fully Booked"}
                    </span>
                  </div>

                  {/* --- UPDATED: Single primary action button --- */}
                  <div className="flex gap-2">
                    {product.category === "cake" ? (
                      <button
                        onClick={() => handlePersonalize(product)}
                        disabled={product.countInStock === 0}
                        className={`w-full ${product.countInStock > 0 ? "bg-red-500 hover:bg-red-600 text-white shadow-md rounded" : "bg-gray-200 text-gray-400 cursor-not-allowed"} font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all`}
                      >
                        Personalize
                      </button>
                    ) : (
                      <button
                        onClick={() => setQuickAddProduct(product)}
                        disabled={product.countInStock === 0}
                        className={`w-full ${product.countInStock > 0 ? "bg-red-500 hover:bg-red-600 text-white shadow-md rounded" : "bg-gray-200 text-gray-400 cursor-not-allowed"} font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all`}
                      >
                        Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal now properly passes the quick add function down so Breads can be ordered from the modal */}
      <ProductDetailModal
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
        onPersonalize={handlePersonalize}
        onQuickAdd={(p) => {
          setDetailProduct(null);
          setQuickAddProduct(p);
        }}
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
