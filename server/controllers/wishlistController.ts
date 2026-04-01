import { Request, Response } from "express";
import Wishlist from "../models/Wishlist.js";

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate("products");
    res.json({ success: true, data: wishlist?.products ?? [] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
      return res.json({ success: true, added: true, data: wishlist.products });
    }

    const exists = wishlist.products.some((p) => p.toString() === productId);

    if (exists) {
      wishlist.products = wishlist.products.filter((p) => p.toString() !== productId) as any;
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.json({ success: true, added: !exists, data: wishlist.products });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};