import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { getDashboardData, getDeliveryPartners, createDeliveryPartner, updateDeliveryPartner, assignDeliveryForOrder } from "../controller/adminController.js";

const adminRouter = Router()

adminRouter.get(
  "/dashboard",
  protect,adminOnly,
  getDashboardData
);

adminRouter.get(
  "/delivery-partners",
  protect,adminOnly,
  getDeliveryPartners
);

adminRouter.post(
  "/delivery-partners",
  protect,adminOnly,
  createDeliveryPartner
);

adminRouter.put(
  "/delivery-partners/:id",
  protect,adminOnly,
  updateDeliveryPartner
);

adminRouter.put(
  "/orders/:orderId/assign",
  protect,adminOnly,
  assignDeliveryForOrder
);

export default adminRouter