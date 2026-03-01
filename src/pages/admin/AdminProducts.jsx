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
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import GridViewIcon from "@mui/icons-material/GridView";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const API_URL = "https://bakereserve-api.onrender.com/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
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
    piecesPerPack: 1,
  });

  const [sizes, setSizes] = useState([]);
  const [restockData, setRestockData] = useState({
    id: null,
    name: "",
    currentStock: 0,
    addAmount: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // NEW: State for Custom Delete Modal
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

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

  const filteredProducts = products.filter((p) =>
    activeTab === "all" ? true : p.category === activeTab,
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024)
        return alert("File size exceeds 2MB. Please upload a smaller image.");
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.type === "number" && Number(value) < 0) value = 0;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const addSize = () => setSizes([...sizes, { size: "", price: "" }]);
  const removeSize = (index) => setSizes(sizes.filter((_, i) => i !== index));
  const handleSizeChange = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
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
    setRestockOpen(false);

    try {
      await axios.put(
        `${API_URL}/products/${restockData.id}`,
        { countInStock: newStock },
        config,
      );
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Failed to restock. Server error.",
      );
      fetchProducts();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price || !formData.description)
      return alert("Please fill in required fields");
    if (!editMode && !imageFile) return alert("Please upload a product image");

    setSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", Number(formData.price));
    data.append("countInStock", Number(formData.countInStock));
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("piecesPerPack", Number(formData.piecesPerPack) || 1);

    const validSizes = sizes
      .filter((s) => s.size.trim() !== "" && s.price !== "")
      .map((s) => {
        let sizeStr = s.size.trim();
        if (!sizeStr.toLowerCase().includes("inch")) sizeStr += "inch";
        return { size: sizeStr, price: Number(s.price) };
      });
    data.append("sizes", JSON.stringify(validSizes));

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
    } catch (error) {
      alert(
        `Error saving product: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/products/${id}`, config);
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert(
        `Delete failed: ${error.response?.data?.message || "Server Error"}`,
      );
    } finally {
      setDeletingId(null);
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
      piecesPerPack: product.piecesPerPack || 1,
    });
    setSizes(product.sizes || []);
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
      piecesPerPack: 1,
    });
    setSizes([]);
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
                <th className="p-4 border-b text-center">Daily Capacity</th>
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
                    {product.category === "bakery" && (
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                        {product.piecesPerPack} pcs / pack
                      </p>
                    )}
                  </td>
                  <td className="p-4 font-mono font-bold text-gray-700">
                    ₱ {product.price}{" "}
                    {product.sizes?.length > 0 && (
                      <span className="text-[10px] text-gray-400 block">
                        + {product.sizes.length} sizes
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`font-bold ${product.countInStock < 10 ? "text-red-600" : "text-gray-800"}`}
                      >
                        {product.countInStock} Slots
                      </span>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon fontSize="small" />}
                        onClick={() => openRestockModal(product)}
                        sx={{ fontSize: "0.7rem", padding: "1px 6px" }}
                      >
                        Add Slots
                      </Button>
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <IconButton
                      color="primary"
                      onClick={() => openEditModal(product)}
                      disabled={deletingId === product._id}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() =>
                        setConfirmDelete({ open: true, id: product._id })
                      }
                      disabled={deletingId === product._id}
                    >
                      {deletingId === product._id ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <DeleteOutlineIcon />
                      )}
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
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
                    <p className="text-xs text-gray-500">
                      Click to upload (Max 2MB)
                    </p>
                  </div>
                )}
                <input
                  id="fileInput"
                  type="file"
                  hidden
                  accept="image/jpeg, image/png, image/jpg"
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
                  label="Base Price"
                  name="price"
                  type="number"
                  fullWidth
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    inputProps: { min: 0 },
                    startAdornment: (
                      <InputAdornment position="start">₱</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Max Daily Slots"
                  name="countInStock"
                  type="number"
                  fullWidth
                  value={formData.countInStock}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
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

                {formData.category === "bakery" && (
                  <TextField
                    label="Pieces per Pack"
                    name="piecesPerPack"
                    type="number"
                    fullWidth
                    value={formData.piecesPerPack}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                )}
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

              {formData.category === "cake" && (
                <>
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

                  <div className="border border-gray-200 p-4 rounded-xl bg-gray-50 shadow-sm mt-2">
                    <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                      <AddCircleOutlineIcon fontSize="small" /> Cake Sizes &
                      Additional Prices
                    </h4>
                    {sizes.map((s, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <TextField
                          size="small"
                          label="Size (e.g. 12)"
                          value={s.size}
                          onChange={(e) =>
                            handleSizeChange(index, "size", e.target.value)
                          }
                          fullWidth
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Add'l Price (+)"
                          value={s.price}
                          onChange={(e) =>
                            handleSizeChange(index, "price", e.target.value)
                          }
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₱
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button color="error" onClick={() => removeSize(index)}>
                          <CloseIcon />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={addSize}
                      sx={{ fontWeight: "bold", textTransform: "none" }}
                    >
                      + Add Size Option
                    </Button>
                    <p className="text-[10px] text-gray-500 mt-2">
                      * Size prices are added to the Base Price. "inch" will
                      automatically append.
                    </p>
                  </div>
                </>
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

      {/* --- RESTORED: ADD SLOTS MODAL --- */}
      <Dialog
        open={restockOpen}
        onClose={() => setRestockOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold border-b pb-3">
          Add Daily Slots
        </DialogTitle>
        <DialogContent className="pt-4">
          <p className="mb-4 text-gray-700">
            Add daily capacity for: <b>{restockData.name}</b>
          </p>
          <TextField
            label="Additional Slots"
            type="number"
            fullWidth
            autoFocus
            value={restockData.addAmount}
            onChange={(e) => {
              if (Number(e.target.value) >= 0)
                setRestockData({ ...restockData, addAmount: e.target.value });
            }}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRestockOpen(false)}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitRestock}
            variant="contained"
            sx={{ bgcolor: "#111827", fontWeight: "bold" }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- NEW: CONFIRM DELETE PRODUCT MODAL --- */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold text-red-600 border-b pb-3">
          Remove Product
        </DialogTitle>
        <DialogContent className="pt-4">
          <p className="text-gray-700">
            Are you sure you want to remove this product from the menu?
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This will hide it from customers, but keep it visible in past order
            records.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #f3f4f6" }}>
          <Button
            onClick={() => setConfirmDelete({ open: false, id: null })}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(confirmDelete.id);
              setConfirmDelete({ open: false, id: null });
            }}
            variant="contained"
            color="error"
            sx={{ fontWeight: "bold" }}
          >
            Yes, Remove It
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default AdminProducts;
