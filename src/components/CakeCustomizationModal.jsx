import { useState } from "react"; // Removed useEffect import
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import CakeIcon from "@mui/icons-material/Cake";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import EditNoteIcon from "@mui/icons-material/EditNote";

const CakeCustomizationModal = ({ open, onClose, product, onAddToCart }) => {
  // Initialize state directly from props.
  // The 'key' in the parent component ensures this resets when product changes.
  const [customization, setCustomization] = useState({
    message: "",
    flavor: "",
    color: "",
    shape: product?.subCategory || "Round",
    notes: "",
  });

  const handleChange = (e) => {
    setCustomization({ ...customization, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onAddToCart(product, customization);
    onClose();
  };

  if (!product) return null;

  const flavors = [
    "Chocolate",
    "Vanilla",
    "Mocha",
    "Ube",
    "Strawberry",
    "Red Velvet",
    "Caramel",
  ];
  const shapes = ["Round", "Square", "Heart", "Rectangle (Sheet)", "Tiered"];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* HEADER */}
      <DialogTitle className="flex justify-between items-center font-bold border-b pb-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <CakeIcon className="text-amber-500" />
          <span className="text-gray-800">Customize Your Cake</span>
        </div>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="pt-6">
        {/* PRODUCT SUMMARY CARD */}
        <div className="flex items-start gap-4 mb-6 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 leading-tight">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              {product.subCategory || "Custom Cake"}
            </p>
            <p className="font-bold text-amber-600">
              Base Price: ₱ {product.price}
            </p>
          </div>
        </div>

        <Divider className="mb-6">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-bold px-2">
            Customization Details
          </span>
        </Divider>

        {/* FORM FIELDS */}
        <div className="flex flex-col gap-5">
          {/* Dedication */}
          <TextField
            label="Dedication / Message"
            name="message"
            fullWidth
            variant="outlined"
            value={customization.message}
            onChange={handleChange}
            placeholder="e.g. Happy 18th Birthday Anna!"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EditNoteIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          {/* Flavor & Shape Grid */}
          <div className="grid grid-cols-2 gap-4">
            <TextField
              select
              label="Flavor"
              name="flavor"
              fullWidth
              value={customization.flavor}
              onChange={handleChange}
            >
              {flavors.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Shape"
              name="shape"
              fullWidth
              value={customization.shape}
              onChange={handleChange}
            >
              {shapes.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* Color Theme */}
          <TextField
            label="Theme Colors"
            name="color"
            fullWidth
            value={customization.color}
            onChange={handleChange}
            placeholder="e.g. Pastel Pink & Gold"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ColorLensIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          {/* Notes */}
          <TextField
            label="Special Instructions"
            name="notes"
            fullWidth
            multiline
            rows={3}
            value={customization.notes}
            onChange={handleChange}
            placeholder="Describe specific design elements, allergies, or other requests..."
            helperText="* Final price may change based on complex designs."
          />
        </div>
      </DialogContent>

      {/* FOOTER ACTIONS */}
      <DialogActions
        sx={{
          padding: "20px",
          borderTop: "1px solid #f3f4f6",
          backgroundColor: "#f9fafb",
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          size="large"
          sx={{ textTransform: "none", fontWeight: "bold", color: "#6b7280" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#D97706",
            textTransform: "none",
            fontWeight: "bold",
            paddingX: 4,
            boxShadow: "0 4px 6px -1px rgba(217, 119, 6, 0.4)",
            "&:hover": { bgcolor: "#B45309" },
          }}
        >
          Add to Cart - ₱ {product.price}*
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CakeCustomizationModal;
