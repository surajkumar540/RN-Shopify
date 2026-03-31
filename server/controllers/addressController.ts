import { Request, Response } from "express";
import Address from "../models/Address.js";

export const getAddress = async (req: Request, res: Response) => {
    try {
        console.log("req.user._id:", req.user._id);
        console.log("req.user._id type:", typeof req.user._id);
        
        const address = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        console.log("Found addresses:", address.length);
        
        res.status(200).json({ success: true, data: address });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addAddress = async (req: Request, res: Response) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;

        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const newAddress = await Address.create({
            user: req.user._id,
            type, street, city, state, zipCode, country,
            isDefault: isDefault || false
        });
        res.status(201).json({ success: true, data: newAddress }); // ✅ status(201)
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateAddress = async (req: Request, res: Response) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;

        let addressItem = await Address.findById(req.params.id);
        if (!addressItem) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        if (addressItem.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        addressItem = await Address.findByIdAndUpdate(
            req.params.id,
            { type, street, city, state, zipCode, country, isDefault },
            { new: true }
        );

        res.status(200).json({ success: true, data: addressItem }); // ✅ status(200)
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await address.deleteOne();
        res.status(200).json({ success: true, message: "Address removed successfully" }); // ✅ status(200)
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};