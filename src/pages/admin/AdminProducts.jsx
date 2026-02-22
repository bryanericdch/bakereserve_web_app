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
import InputAdornment from "@mui/material/InputAdornment";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import GridViewIcon from "@mui/icons-material/GridView";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

// USE THIS FOR LOCAL TESTING:
//const API_URL = "http://localhost:5000/api";
const API_URL = "https://bakereserve-api.onrender.com/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const [open, setOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "bakery",
    subCategory: "",
    flavor: "",
    description: "",
    countInStock: 0,
  });

  const [restockData, setRestockData] = useState({
    id: null,
    name: "",
    currentStock: 0,
    addAmount: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  // --- FLAVOR LIST ---
  const cakeFlavors = [
    "Chocolate",
    "Vanilla",
    "Mocha",
    "Ube",
    "Strawberry",
    "Red Velvet",
    "Caramel",
  ];
  const cakeTypes = [
    "Round Cake",
    "Square Cake",
    "Roll Cake",
    "Heart Cake",
    "Tiered Cake",
    "Sheet Cake",
    "Cupcake",
  ];

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

  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return true;
    return p.category === activeTab;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openRestockModal = (product) => {
    setRestockData({
      id: product._id,
      name: product.name,
      currentStock: product.countInStock,
      addAmount: "",
    });
    setRestockOpen(true);
  };

  const submitRestock = async () => {
    if (!restockData.addAmount || Number(restockData.addAmount) <= 0) return;
    const newStock = restockData.currentStock + Number(restockData.addAmount);
    setProducts(
      products.map((p) =>
        p._id === restockData.id ? { ...p, countInStock: newStock } : p,
      ),
    );
    setRestockOpen(false);
    try {
      await axios.put(
        `${API_URL}/products/${restockData.id}`,
        { countInStock: newStock },
        config,
      );
      fetchProducts();
    } catch {
      fetchProducts();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price || !formData.description) {
      alert("Please fill in required fields");
      return;
    }
    setSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", Number(formData.price));
    data.append("countInStock", Number(formData.countInStock));
    data.append("description", formData.description);
    data.append("category", formData.category);

    if (formData.category === "cake") {
      if (formData.subCategory)
        data.append("subCategory", formData.subCategory);
      if (formData.flavor) data.append("flavor", formData.flavor);
    }

    if (imageFile) data.append("image", imageFile);

    try {
      const uploadConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      if (editMode)
        await axios.put(
          `${API_URL}/products/${selectedId}`,
          data,
          uploadConfig,
        );
      else await axios.post(`${API_URL}/products`, data, uploadConfig);
      setOpen(false);
      fetchProducts();
      resetForm();
    } catch {
      alert("Error saving product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, config);
      fetchProducts();
    } catch {
      alert("Failed to delete");
    }
  };

  const openEditModal = (product) => {
    setEditMode(true);
    setSelectedId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category || "bakery",
      subCategory: product.subCategory || "",
      flavor: product.flavor || "",
      description: product.description,
      countInStock: product.countInStock,
    });
    setImagePreview(product.image);
    setImageFile(null);
    setOpen(true);
  };

  const resetForm = () => {
    setEditMode(false);
    setSelectedId(null);
    setFormData({
      name: "",
      price: "",
      category: "bakery",
      subCategory: "",
      flavor: "",
      description: "",
      countInStock: 0,
    });
    setImageFile(null);
    setImagePreview("");
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "all" ? "bg-gray-800 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <GridViewIcon fontSize="small" /> All
          </button>
          <button
            onClick={() => setActiveTab("bakery")}
            className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "bakery" ? "bg-amber-500 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <BakeryDiningOutlinedIcon fontSize="small" /> Breads
          </button>
          <button
            onClick={() => setActiveTab("cake")}
            className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "cake" ? "bg-pink-500 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
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
            "&:hover": { backgroundColor: "#374151" },
          }}
        >
          Add Product
        </Button>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <CircularProgress />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4 border-b">Product</th>
                <th className="p-4 border-b">Category</th>
                <th className="p-4 border-b">Price</th>
                <th className="p-4 border-b text-center">Stock</th>
                <th className="p-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 border"
                    />
                    <div>
                      <span className="font-bold text-gray-800 block">
                        {product.name}
                      </span>
                      {product.flavor && (
                        <span className="text-xs text-amber-600 font-medium">
                          Flavor: {product.flavor}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${product.category === "cake" ? "bg-pink-100 text-pink-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {product.category}
                    </span>
                    {product.subCategory && (
                      <p className="text-xs text-gray-500 mt-1">
                        {product.subCategory}
                      </p>
                    )}
                  </td>
                  <td className="p-4 font-mono font-bold text-gray-700">
                    ₱ {product.price}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`font-bold ${product.countInStock < 10 ? "text-red-600" : "text-gray-800"}`}
                      >
                        {product.countInStock}
                      </span>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon fontSize="small" />}
                        onClick={() => openRestockModal(product)}
                        sx={{ fontSize: "0.7rem", padding: "1px 6px" }}
                      >
                        Restock
                      </Button>
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

      {/* ADD/EDIT MODAL */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center font-bold border-b pb-4">
          {editMode ? "Edit Product" : "Add New Product"}
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="pt-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Product Image *
              </label>
              <div
                className="w-full aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer hover:border-gray-400 transition"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <CloudUploadIcon
                      className="text-gray-300 mb-2"
                      style={{ fontSize: 40 }}
                    />
                    <p className="text-xs text-gray-500">Click to upload</p>
                  </div>
                )}
                <input
                  id="fileInput"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <TextField
                label="Product Name"
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  fullWidth
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₱</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Stock"
                  name="countInStock"
                  type="number"
                  fullWidth
                  value={formData.countInStock}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  select
                  label="Category"
                  name="category"
                  fullWidth
                  value={formData.category}
                  onChange={handleChange}
                >
                  <MenuItem value="bakery">Bread / Bakery</MenuItem>
                  <MenuItem value="cake">Cake</MenuItem>
                </TextField>
                {formData.category === "cake" && (
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

              {/* UPDATED FLAVOR SELECTION */}
              {formData.category === "cake" && (
                <TextField
                  select
                  label="Cake Flavor"
                  name="flavor"
                  fullWidth
                  value={formData.flavor}
                  onChange={handleChange}
                >
                  {cakeFlavors.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: "20px", borderTop: "1px solid #f3f4f6" }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            sx={{ bgcolor: "#111827" }}
          >
            {submitting ? "Saving..." : "Save Product"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* RESTOCK MODAL */}
      <Dialog
        open={restockOpen}
        onClose={() => setRestockOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Restock</DialogTitle>
        <DialogContent className="pt-4">
          <p className="mb-4">
            Add stock for: <b>{restockData.name}</b>
          </p>
          <TextField
            label="Amount to Add"
            type="number"
            fullWidth
            autoFocus
            value={restockData.addAmount}
            onChange={(e) =>
              setRestockData({ ...restockData, addAmount: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestockOpen(false)}>Cancel</Button>
          <Button onClick={submitRestock} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
