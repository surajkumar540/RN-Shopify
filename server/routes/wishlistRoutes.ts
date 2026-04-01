import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/auth.js";

const WishlistRouter = express.Router();

WishlistRouter.get("/", protect, getWishlist);
WishlistRouter.post("/toggle", protect, toggleWishlist);

export default WishlistRouter;