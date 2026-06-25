import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getOrderLocation,
} from "../controller/orderController.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const orderRouter = Router();

// User
orderRouter.post("/", protect, createOrder);

orderRouter.get("/", protect, getMyOrders);

orderRouter.get("/:id", protect, getOrderById);

orderRouter.get("/:id/location", protect, getOrderLocation);

// Admin
orderRouter.get("/all", protect, adminOnly, getAllOrders);

orderRouter.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default orderRouter;
