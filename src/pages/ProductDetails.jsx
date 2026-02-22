import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// USE LOCALHOST FOR TESTING
//const API_URL = "http://localhost:5000/api";
const API_URL = "https://bakereserve-api.onrender.com/api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Customization State (Reduced for Pre-made)
  const [customization, setCustomization] = useState({
    message: "",
    tiers: "1", // Default to 1
    notes: "",
  });

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products/${id}`);
        setProduct(data);
      } catch {
        console.error("Error fetching product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleCustomChange = (e) => {
    setCustomization({ ...customization, [e.target.name]: e.target.value });
  };

  const addToCart = async () => {
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
          quantity: quantity,
          customization:
            product.category === "cake"
              ? {
                  ...customization,
                  flavor: product.flavor, // Auto-attach the fixed flavor
                  shape: product.subCategory, // Auto-attach fixed shape
                  isCustomBuild: false,
                }
              : {},
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } },
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

  if (loading)
    return (
      <div className="flex justify-center mt-20">
        <CircularProgress />
      </div>
    );
  if (!product)
    return <div className="text-center mt-20">Product not found.</div>;

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

      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 font-semibold"
        >
          <ArrowBackIcon fontSize="small" /> Back to Menu
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-xl"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-bold text-gray-900 mb-1">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              {product.subCategory && (
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {product.subCategory}
                </span>
              )}
              {product.flavor && (
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {product.flavor}
                </span>
              )}
            </div>

            <p className="text-2xl font-bold text-red-500 mb-4">
              ₱ {product.price}
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* SIMPLIFIED CUSTOMIZATION (For Pre-Made Cakes) */}
            {product.category === "cake" && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 space-y-4">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">
                  Personalize Your Cake
                </h3>

                <TextField
                  fullWidth
                  label="Dedication Message"
                  name="message"
                  value={customization.message}
                  onChange={handleCustomChange}
                  placeholder="Happy Birthday..."
                  variant="outlined"
                  size="small"
                />

                {/* Only show Tier selection if it is a Tiered Cake */}
                {product.subCategory === "Tiered Cake" && (
                  <TextField
                    select
                    fullWidth
                    label="Number of Tiers"
                    name="tiers"
                    value={customization.tiers}
                    onChange={handleCustomChange}
                    size="small"
                  >
                    <MenuItem value="1">1 Tier</MenuItem>
                    <MenuItem value="2">2 Tiers</MenuItem>
                    <MenuItem value="3">3 Tiers</MenuItem>
                  </TextField>
                )}

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Additional Notes"
                  name="notes"
                  value={customization.notes}
                  onChange={handleCustomChange}
                  placeholder="Any specific instructions..."
                  size="small"
                />
              </div>
            )}

            <div className="flex items-center gap-4 mt-auto">
              <TextField
                label="Qty"
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                sx={{ width: 80 }}
                InputProps={{ inputProps: { min: 1 } }}
              />
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<AddShoppingCartIcon />}
                onClick={addToCart}
                disabled={product.countInStock === 0}
                sx={{
                  bgcolor: product.countInStock > 0 ? "#EF4444" : "#9CA3AF",
                  height: "56px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    bgcolor: product.countInStock > 0 ? "#DC2626" : "#9CA3AF",
                  },
                }}
              >
                {product.countInStock > 0 ? "Add to Order" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
