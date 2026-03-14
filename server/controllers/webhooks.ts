import { verifyWebhook } from '@clerk/express/webhooks'
import { Request, Response } from "express"
import User from '../models/User.js'
import connectDB from '../config/db.js'

export const clerkWebhook = async (req: Request, res: Response) => {
  try {
    await connectDB(); // ✅ connect here, safe to call multiple times

    console.log("Webhook hit ✅");

    const evt = await verifyWebhook(req);

    console.log("Event type:", evt.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const userData = {
        clerkId: evt.data.id,
        email: evt.data.email_addresses?.[0]?.email_address,
        name: `${evt.data.first_name} ${evt.data.last_name}`,
        image: evt.data.image_url,
      };

      await User.findOneAndUpdate(
        { clerkId: evt.data.id },
        userData,
        { upsert: true, new: true } // ✅ handles both create + update in one query
      );

      console.log("User saved ✅", userData.email);
    }

    if (evt.type === "user.deleted") {
      await User.findOneAndDelete({ clerkId: evt.data.id });
      console.log("User deleted ✅", evt.data.id);
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return res.status(400).json({
      success: false,
      message: "Webhook verification failed",
    });
  }
};