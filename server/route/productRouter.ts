import { Router } from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getFlashDeals,
  getProductsByCategory,
  searchProducts,
} from "../controller/productController.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const productRouter = Router();

productRouter.get("/", getProducts);
productRouter.get("/flash-deals", getFlashDeals);
productRouter.get("/search", searchProducts);
productRouter.get("/category/:category", getProductsByCategory);
productRouter.get("/:id", getProduct);

// Admin
productRouter.post("/",protect,adminOnly, createProduct);
productRouter.put("/:id",protect,adminOnly, updateProduct);
productRouter.delete("/:id",protect,adminOnly, deleteProduct);

export default productRouter;