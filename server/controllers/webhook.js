import { Webhook } from "svix";
import Stripe from "stripe";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

// Clerk webhook
const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.json({});
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }

      default:
        res.json({ success: true });
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Stripe webhook
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Stripe event received: ${event.type}`);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      console.log("Payment succeeded:", paymentIntent.id);

      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!session.data.length) {
        console.error("No checkout session found for paymentIntent:", paymentIntentId);
        break;
      }

      const { purchaseId } = session.data[0].metadata;
      console.log("Purchase ID:", purchaseId);

      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) {
        console.error("Purchase not found in database:", purchaseId);
        break;
      }

      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId.toString());

      if (!userData || !courseData) {
        console.error("User or course missing for purchase:", purchaseId);
        break;
      }

      courseData.enrolledStudents.push(userData);
      await courseData.save();

      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      purchaseData.status = "completed";
      await purchaseData.save();

      console.log("Purchase completed successfully:", purchaseId);
      break;
    }

    case "payment_intent.failed": {
      const paymentIntent = event.data.object;
      console.error("Payment failed:", paymentIntent.last_payment_error?.message);

      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!session.data.length) {
        console.error("No session found for failed paymentIntent:", paymentIntentId);
        break;
      }

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);

      if (purchaseData) {
        purchaseData.status = "failed";
        await purchaseData.save();
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  response.json({ received: true });
};


export const testerUpdateDB = async (userId, courseId) => {
  if (!userId || !courseId) {
    throw new Error("userId and courseId are required");
  }

  try {
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      throw new Error("User or course not found");
    }

    // Enroll user in course
    if (!courseData.enrolledStudents.includes(userId)) {
      courseData.enrolledStudents.push(userId);
      await courseData.save();
    }

    // Add course to user's enrolled courses
    if (!userData.enrolledCourses.includes(courseId)) {
      userData.enrolledCourses.push(courseId);
      await userData.save();
    }

    console.log(`User ${userId} enrolled in course ${courseId} successfully.`);
    return { success: true, message: `User ${userId} enrolled in course ${courseId}` };
  } catch (err) {
    console.error("Error enrolling user:", err);
    return { success: false, error: err.message };
  }
};

export { clerkWebhooks };

