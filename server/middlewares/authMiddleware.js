import { clerkClient } from "@clerk/express";

// Middleware (Protect Educator Routes)
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const user = await clerkClient.users.getUser(userId);

    // Check if user has role set as "educator"
    if (user.publicMetadata.role !== 'educator') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
