import { verifyWebhook } from "@clerk/express/webhooks";
import { Request, Response } from "express";
import User from "../models/User.js";
import connectDB from "../config/db.js";

export const clerkWebhook = async (req: Request, res: Response) => {
  try {
    await connectDB();

    console.log("Webhook hit ✅");

    const evt = await verifyWebhook(req);

    console.log("Event type:", evt.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {

      const userData = {
        clerkId: evt.data.id,
        email: evt.data.email_addresses?.[0]?.email_address || "",
        name: `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim(),
        image: evt.data.image_url,
      };

      await User.findOneAndUpdate(
        { clerkId: evt.data.id },
        userData,
        { upsert: true, new: true }
      );

      console.log("User saved ✅", userData.email);
    }

    if (evt.type === "user.deleted") {
      await User.findOneAndDelete({ clerkId: evt.data.id });
      console.log("User deleted ✅", evt.data.id);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Webhook Error:", err);

    return res.status(400).json({
      success: false,
      message: "Webhook verification failed",
    });
  }
};