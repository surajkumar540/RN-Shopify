import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrder,
  getOrders,
  UpdateOrderStatus,
} from "../controllers/ordersController.js";
import { authorize, protect } from "../middleware/auth.js";

const OrderRouter = express.Router();

// Get user orders
OrderRouter.get("/", protect, getOrders);

// Get single order
OrderRouter.get("/:id", protect, getOrder);

// Create order from cart
OrderRouter.post("/", protect, createOrder);

// Update order Status (Admin only)
OrderRouter.put("/:id/status", protect, authorize("admin"), UpdateOrderStatus);

// Create all order (Admin Only)
OrderRouter.get("/admin/all", protect, authorize("admin"), getAllOrders);

export default OrderRouter;
