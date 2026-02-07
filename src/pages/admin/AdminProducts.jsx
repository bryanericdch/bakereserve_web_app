import { useEffect, useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

// Icons
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const API_URL = "https://bakereserve-api.onrender.com/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bakery"); // 'bakery' | 'cake'

  // Modal States
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "bakery",
    subCategory: "",
    description: "",
    countInStock: 0,
  });

  // Image State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products`);
      setProducts(data);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- FILTER PRODUCTS BY TAB ---
  // Matches 'category' in your Product.js model
  const filteredProducts = products.filter((p) => p.category === activeTab);

  // --- FILE SELECT HANDLER ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Create local preview
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SUBMIT (CREATE / UPDATE) ---
  const handleSubmit = async () => {
    // 1. Basic Validation
    if (!formData.name || !formData.price || !formData.description) {
      alert("Please fill in all required fields (Name, Price, Description)");
      return;
    }

    // 2. Image Validation (Required for new products)
    if (!editMode && !imageFile) {
      alert("Please select an image for the new product.");
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    // Ensure numbers are valid, default to 0 if empty
    data.append("price", Number(formData.price) || 0);
    data.append("countInStock", Number(formData.countInStock) || 0);
    data.append("description", formData.description);
    data.append("category", activeTab);

    if (activeTab === "cake" && formData.subCategory) {
      data.append("subCategory", formData.subCategory);
    }

    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const uploadConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      if (editMode) {
        await axios.put(
          `${API_URL}/products/${selectedId}`,
          data,
          uploadConfig,
        );
      } else {
        await axios.post(`${API_URL}/products`, data, uploadConfig);
      }

      setOpen(false);
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error saving product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, config);
      fetchProducts();
    } catch {
      alert("Failed to delete");
    }
  };

  const updateStock = async (id, currentStock, change) => {
    const newStock = currentStock + change;
    if (newStock < 0) return;

    // Optimistic Update
    setProducts(
      products.map((p) =>
        p._id === id ? { ...p, countInStock: newStock } : p,
      ),
    );

    try {
      // Send partial update
      await axios.put(
        `${API_URL}/products/${id}`,
        { countInStock: newStock },
        config,
      );
    } catch {
      fetchProducts(); // Revert on error
    }
  };

  const openEditModal = (product) => {
    setEditMode(true);
    setSelectedId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory || "",
      description: product.description,
      countInStock: product.countInStock,
    });
    setImagePreview(product.image); // Show existing image
    setImageFile(null); // Reset file input
    setOpen(true);
  };

  const resetForm = () => {
    setEditMode(false);
    setSelectedId(null);
    setFormData({
      name: "",
      price: "",
      category: activeTab,
      subCategory: "",
      description: "",
      countInStock: 0,
    });
    setImageFile(null);
    setImagePreview("");
  };

  // Matches your Product.js model enum
  const cakeTypes = [
    "Round Cake",
    "Square Cake",
    "Roll Cake",
    "Heart Cake",
    "Tiered Cake",
    "Sheet Cake",
    "Cupcake",
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      {/* HEADER & TABS */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Tab Switcher */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
          <button
            onClick={() => setActiveTab("bakery")}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "bakery" ? "bg-amber-500 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <BakeryDiningOutlinedIcon fontSize="small" /> Breads
          </button>
          <button
            onClick={() => setActiveTab("cake")}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "cake" ? "bg-pink-500 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <CakeOutlinedIcon fontSize="small" /> Cakes
          </button>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          sx={{
            backgroundColor: "#111827",
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": { backgroundColor: "#374151" },
          }}
        >
          Add {activeTab === "cake" ? "Cake" : "Bread"}
        </Button>
      </div>

      {/* PRODUCT TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <CircularProgress />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Inventory2OutlinedIcon
              sx={{ fontSize: 60, opacity: 0.3, marginBottom: 1 }}
            />
            <p>No {activeTab} products found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4 border-b">Product</th>
                <th className="p-4 border-b">Details</th>
                <th className="p-4 border-b">Price</th>
                <th className="p-4 border-b text-center">Stock</th>
                <th className="p-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Inventory2OutlinedIcon fontSize="small" />
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-gray-800">
                      {product.name}
                    </span>
                  </td>

                  <td className="p-4">
                    {product.category === "cake" && product.subCategory ? (
                      <span className="bg-pink-50 text-pink-600 px-2 py-1 rounded text-xs font-bold border border-pink-100">
                        {product.subCategory}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 italic truncate max-w-[150px] block">
                        {product.description}
                      </span>
                    )}
                  </td>

                  <td className="p-4 font-mono font-bold text-gray-700">
                    ₱ {product.price}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateStock(product._id, product.countInStock, -1)
                        }
                        disabled={product.countInStock <= 0}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <span
                        className={`w-8 text-center font-bold ${product.countInStock < 10 ? "text-red-500" : "text-gray-800"}`}
                      >
                        {product.countInStock}
                      </span>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateStock(product._id, product.countInStock, 1)
                        }
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </td>

                  <td className="p-4 text-right space-x-1">
                    <IconButton
                      color="primary"
                      onClick={() => openEditModal(product)}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(product._id)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold border-b pb-4">
          {editMode
            ? `Edit ${activeTab === "cake" ? "Cake" : "Bread"}`
            : `Add New ${activeTab === "cake" ? "Cake" : "Bread"}`}
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="space-y-4 pt-4">
            {/* Image Upload Area */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Inventory2OutlinedIcon className="text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700 mb-1">
                  Product Image
                </p>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  size="small"
                >
                  Select Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                <p className="text-xs text-gray-400 mt-1">
                  {imageFile ? imageFile.name : "No file selected"}
                </p>
              </div>
            </div>

            <TextField
              label="Product Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Price (₱)"
                name="price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={handleChange}
              />
              <TextField
                label="Initial Stock"
                name="countInStock"
                type="number"
                fullWidth
                value={formData.countInStock}
                onChange={handleChange}
              />
            </div>

            {/* Show Cake Type dropdown ONLY if tab is Cake */}
            {activeTab === "cake" && (
              <TextField
                select
                label="Cake Type"
                name="subCategory"
                fullWidth
                value={formData.subCategory}
                onChange={handleChange}
              >
                {cakeTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: "16px", borderTop: "1px solid #f3f4f6" }}>
          <Button
            onClick={() => setOpen(false)}
            color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            sx={{ bgcolor: "#111827" }}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : editMode ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
