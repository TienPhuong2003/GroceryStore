import { Router } from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controller/addressesController.js";
import { protect } from "../middleware/auth.middleware.js";

const addressRouter = Router();

addressRouter.get("/", protect, getAddresses);
addressRouter.post("/", protect, createAddress);
addressRouter.put("/:id", protect, updateAddress);
addressRouter.delete("/:id", protect, deleteAddress);

export default addressRouter;