import { Router } from "express";

import deliAuth from "../middleware/delivery.middleware.js";

import {
  loginDeliveryPartner,
  getMyDeliveries,
  getMyDeliveryById,
  completeDelivery,
  cancelDelivery,
  updateDeliveryStatus,
  updateDeliveryLocation,
} from "../controller/deliveryController.js";

const deliveryPartnerRouter = Router();

// Auth
deliveryPartnerRouter.post(
  "/login",
  loginDeliveryPartner,
);

// Orders
deliveryPartnerRouter.get(
  "/my-deliveries",
  deliAuth,
  getMyDeliveries,
);

deliveryPartnerRouter.get(
  "/my-deliveries/:id",
  deliAuth,
  getMyDeliveryById,
);

deliveryPartnerRouter.put(
  "/my-deliveries/:id/status",
  deliAuth,
  updateDeliveryStatus,
);

deliveryPartnerRouter.put(
  "/my-deliveries/:id/location",
  deliAuth,
  updateDeliveryLocation,
);

deliveryPartnerRouter.put(
  "/my-deliveries/:id/complete",
  deliAuth,
  completeDelivery,
);

deliveryPartnerRouter.put(
  "/my-deliveries/:id/cancel",
  deliAuth,
  cancelDelivery,
);

export default deliveryPartnerRouter;