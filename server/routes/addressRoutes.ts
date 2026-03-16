import express from "express";
import { protect } from "../middleware/auth.js";
import { addAddress, deleteAddress, getAddress, updateAddress } from "../controllers/addressController.js";

const AddressRouter = express.Router();

AddressRouter.get("/", protect, getAddress);
AddressRouter.post("/", protect, addAddress);
AddressRouter.put("/:id", protect, updateAddress);
AddressRouter.delete("/:id", protect, deleteAddress);

export default AddressRouter;