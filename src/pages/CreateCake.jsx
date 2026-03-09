import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const API_URL = "https://bakereserve-api.onrender.com/api";

const CreateCake = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [build, setBuild] = useState({
    shape: "Round Cake",
    flavor: "Chocolate",
    tiers: "1",
    designProductId: null,
    size: "",
    message: "",
    notes: "",
  });

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products`);
        setDesigns(data.filter((p) => p.category === "cake"));
      } catch {
        console.error("Error fetching designs");
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  const handleChange = (e) =>
    setBuild({ ...build, [e.target.name]: e.target.value });

  const handleDesignSelect = (id) => {
    const design = designs.find((d) => d._id === id);
    setBuild({
      ...build,
      designProductId: id,
      size: design?.sizes?.[0]?.size || "",
    });
  };

  const addToCart = async () => {
    if (!userInfo.token)
      return setAlert({
        open: true,
        message: "Please login to order",
        severity: "error",
      });
    if (!build.designProductId)
      return setAlert({
        open: true,
        message: "Please select a Cake Design",
        severity: "warning",
      });

    try {
      await axios.post(
        `${API_URL}/cart`,
        {
          productId: build.designProductId,
          quantity: 1,
          customization: {
            isCustomBuild: true,
            shape: build.shape,
            flavor: build.flavor,
            size: build.size,
            tiers: build.shape === "Tiered Cake" ? build.tiers : "N/A",
            message: build.message,
            notes: build.notes,
          },
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } },
      );
      setAlert({
        open: true,
        message: "Custom Cake added to cart!",
        severity: "success",
      });
      setTimeout(() => navigate("/home"), 1500);
    } catch {
      setAlert({
        open: true,
        message: "Failed to add to cart",
        severity: "error",
      });
    }
  };

  const shapes = [
    "Round Cake",
    "Square Cake",
    "Roll Cake",
    "Heart Cake",
    "Tiered Cake",
    "Sheet Cake",
    "Cupcake",
  ];
  const flavors = [
    "Chocolate",
    "Vanilla",
    "Mocha",
    "Ube",
    "Strawberry",
    "Red Velvet",
    "Caramel",
  ];

  const selectedDesign = designs.find((d) => d._id === build.designProductId);
  const availableSizes = selectedDesign?.sizes || [];
  const activeSizeObj = availableSizes.find((s) => s.size === build.size);
  const displayPrice =
    (selectedDesign?.price || 0) + (activeSizeObj ? activeSizeObj.price : 0);

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

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Create Your Own Cake
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit space-y-6 sticky top-6">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">
              1. Build Specifications
            </h3>

            <TextField
              margin="normal"
              select
              fullWidth
              label="Cake Size"
              helperText={"Please select a design reference first."}
              name="size"
              value={build.size}
              onChange={handleChange}
              disabled={!build.designProductId || availableSizes.length === 0}
            >
              {availableSizes.length > 0 ? (
                availableSizes.map((s) => (
                  <MenuItem key={s.size} value={s.size}>
                    {s.size} (+ ₱{s.price})
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">
                  {build.designProductId
                    ? "Standard Size"
                    : "Select a design first"}
                </MenuItem>
              )}
            </TextField>

            <TextField
              margin="normal"
              select
              fullWidth
              label="Cake Shape / Type"
              name="shape"
              value={build.shape}
              onChange={handleChange}
            >
              {shapes.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              margin="normal"
              select
              fullWidth
              label="Flavor"
              name="flavor"
              value={build.flavor}
              onChange={handleChange}
            >
              {flavors.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </TextField>

            {build.shape === "Tiered Cake" && (
              <TextField
                margin="normal"
                select
                fullWidth
                label="Number of Tiers"
                name="tiers"
                value={build.tiers}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t} Tier(s)
                  </MenuItem>
                ))}
              </TextField>
            )}

            <h3 className="font-bold text-lg text-gray-800 border-b pb-2 pt-4">
              3. Personalize
            </h3>
            <TextField
              margin="normal"
              fullWidth
              label="Dedication Message"
              name="message"
              value={build.message}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              multiline
              rows={3}
              label="Additional Notes"
              name="notes"
              value={build.notes}
              onChange={handleChange}
            />

            {build.designProductId && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                  Total Price
                </span>
                <span className="text-2xl font-black text-amber-600">
                  ₱ {displayPrice}
                </span>
              </div>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={addToCart}
              sx={{
                bgcolor: "#F44336",
                "&:hover": { bgcolor: "#E53935" },
                py: 2,
                fontWeight: "bold",
              }}
            >
              Add Custom Cake to Cart
            </Button>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-bold text-lg text-gray-800 mb-4">
              2. Select a Design Reference
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Choose a look from our gallery. We will match this design with
              your chosen flavor and shape.
            </p>

            {loading ? (
              <CircularProgress />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {designs.map((design) => (
                  <div
                    key={design._id}
                    onClick={() => handleDesignSelect(design._id)}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition relative group ${build.designProductId === design._id ? "border-amber-500 ring-2 ring-amber-200" : "border-transparent hover:border-gray-300"}`}
                  >
                    <img
                      src={design.image}
                      className="w-full h-40 object-cover"
                      alt={design.name}
                    />
                    {build.designProductId === design._id && (
                      <div className="absolute top-2 right-2 text-amber-500 bg-white rounded-full p-1 shadow-md">
                        <CheckCircleIcon />
                      </div>
                    )}
                    <div className="p-2 bg-white">
                      <p className="text-xs font-bold text-gray-700 truncate">
                        {design.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateCake;
