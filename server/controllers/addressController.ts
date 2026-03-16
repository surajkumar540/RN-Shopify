import { Request, Response } from "express";
import Address from "../models/Address.js";


// Get user addresses
// Get /api/addresses
export const getAddress = async (req: Request, res: Response) => {
    try {
        const address = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(200).json({ success: true, data: address });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Add new addresses
// Post /api/addresses
export const addAddress = async (req: Request, res: Response) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;

        // If isDefault is true, unset previous default address
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        // 
        const newAddress = await Address.create({
            user: req.user._id,
            type,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false
        });
        res.json(201).json({ success: true, data: newAddress });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update address
// Put /api/addresses/:id
export const updateAddress = async (req: Request, res: Response) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;

        let addressItem = await Address.findById(req.params.id);
        if (!addressItem) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        //Ensure user own address
        if (addressItem.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }


        // If isDefault is true, unset previous default address
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        addressItem = await Address.findByIdAndUpdate(req.params.id, {
            type,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault
        }, { new: true });

        res.json(201).json({ success: true, data: addressItem });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Delete address
// Delete /api/addresses/:id
export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        //Ensure user own address
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await address.deleteOne();

        res.json(201).json({ success: true, message: "Address removed successfully" });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}