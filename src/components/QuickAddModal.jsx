import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const QuickAddModal = ({ open, onClose, product, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleConfirm = () => {
    onConfirm(product, quantity);
    setQuantity(1); // Reset
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="text-center font-bold pb-0">
        Add to Cart
      </DialogTitle>
      <DialogContent className="flex flex-col items-center pt-4">
        <img
          src={product.image}
          className="w-20 h-20 rounded-lg object-cover mb-3"
          alt=""
        />
        <h3 className="font-bold text-gray-800">{product.name}</h3>
        <p className="text-red-500 font-bold mb-4">₱ {product.price}</p>

        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border">
          <IconButton
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            size="small"
          >
            <RemoveIcon />
          </IconButton>
          <span className="text-xl font-bold w-8 text-center">{quantity}</span>
          <IconButton
            onClick={() => setQuantity(quantity + 1)}
            size="small"
            disabled={quantity >= product.countInStock}
          >
            <AddIcon />
          </IconButton>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {product.countInStock} available
        </p>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", paddingBottom: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{ bgcolor: "#EF4444", fontWeight: "bold" }}
        >
          Add {quantity} Item(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddModal;
