import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import EditIcon from "@mui/icons-material/Edit";

const ProductDetailModal = ({
  open,
  onClose,
  product,
  onPersonalize,
  onQuickAdd,
}) => {
  if (!product) return null;

  const isCake = product.category === "cake";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <div className="relative">
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            bgcolor: "rgba(255,255,255,0.8)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <CloseIcon />
        </IconButton>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
      </div>

      <DialogContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <div className="flex gap-2 mt-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded text-gray-600">
                {product.subCategory || product.category}
              </span>
              {product.flavor && (
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 px-2 py-1 rounded text-amber-700">
                  {product.flavor}
                </span>
              )}
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">₱ {product.price}</p>
        </div>

        <p className="text-gray-600 leading-relaxed mb-8">
          {product.description}
        </p>

        <div className="flex gap-3">
          {/* Action Buttons based on Type */}
          {isCake ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<EditIcon />}
              onClick={() => {
                onClose();
                onPersonalize(product);
              }}
              sx={{
                bgcolor: "#D97706",
                "&:hover": { bgcolor: "#B45309" },
                fontWeight: "bold",
              }}
            >
              Personalize & Add
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={() => {
                onClose();
                onQuickAdd(product);
              }}
              disabled={product.countInStock === 0}
              sx={{
                bgcolor: "#EF4444",
                "&:hover": { bgcolor: "#DC2626" },
                fontWeight: "bold",
              }}
            >
              {product.countInStock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
