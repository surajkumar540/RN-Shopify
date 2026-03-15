import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types/index.js";

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number },
    images: [{ type: String }],
    sizes: [{ type: String }],
    category: { type: String, required: true, enum: ["Men", "Women", "Kids", "Shoes", "Bags", "Other"], default: "Other" },
    stock: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;

