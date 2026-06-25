import { Inngest } from "inngest";
import { prisma } from "../config/prisma.js";
import sendEmail from "../config/nodemailer.js";
import { lowStockTemplate } from "../email/low-stock-email-template.js";
import { monthlyDealsTemplate } from "../email/offer-email-template.js";

const LOW_STOCK_THRESHOLD = 10;

// Create a client to send and receive events
export const inngest = new Inngest({ id: "grocery-delivery" });

export const checkLowStock = inngest.createFunction(
  {
    id: "check-low-stock",
    name: "Low Stock Alert",
    triggers: [
      {
        event: "inventory/stock.update",
      },
    ],
  },
  async ({ event, step }) => {
    const { productId } = event.data;

    const product = await step.run("fetch-product", async () => {
      return prisma.product.findUnique({
        where: {
          id: productId,
        },
      });
    });

    if (!product) {
      return {
        skipped: true,
        reason: "Product not found",
      };
    }

    if (product.stock == null || product.stock >= LOW_STOCK_THRESHOLD) {
      return {
        skipped: true,
        stock: product.stock,
      };
    }

    await step.run("send-low-stock-email", async () => {
      const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim())
        : [];

      if (adminEmails.length === 0) {
        return {
          skipped: true,
          reason: "No admin emails",
        };
      }

      await sendEmail({
        to: adminEmails.join(","),
        subject: `⚠️ Low Stock Alert - ${product.name}`,
        body: lowStockTemplate(product),
      });

      return {
        success: true,
        emailsSent: adminEmails.length,
      };
    });

    return {
      alerted: true,
      productId: product.id,
      stock: product.stock,
    };
  },
);

export const sendMonthlyOffers = inngest.createFunction(
  {
    id: "send-monthly-offers",
    name: "Send Monthly Offers",

    triggers: [
      {
        event: "marketing/monthly-offers",
      },
    ],
  },

  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    });

    if (users.length === 0) {
      return {
        success: false,
        reason: "No users found",
      };
    }

    const deals = await step.run("fetch-deals-and-users", async () => {
      return prisma.product.findMany({
        where: {
          stock: {
            gt: 0,
          },
        },
        orderBy: {
          originalPrice: "desc",
        },
        take: 6,
      });
    });

    if (deals.length === 0) {
      return {
        success: false,
        reason: "No products found",
      };
    }

    const results = await step.run("send-emails", async () => {
      const emails = users.map((user) =>
        sendEmail({
          to: user.email,
          subject: "🔥 Fresh Picks Just For You!",
          body: monthlyDealsTemplate(user, deals),
        }),
      );

      return Promise.allSettled(emails);
    });

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    const failedCount = results.filter((r) => r.status === "rejected").length;

    return {
      success: true,
      users: users.length,
      emailsSent: successCount,
      emailsFailed: failedCount,
    };
  },
);

export const autoAssignRider = inngest.createFunction(
  {
    id: "auto-assign-rider",
    name: "Auto Assign Rider",
    triggers: [
      {
        event: "order/created",
      },
    ],
  },

  async ({ event, step }) => {
    const { orderId } = event.data;

    const order = await step.run("get-order", async () => {
      return prisma.order.findUnique({
        where: { id: orderId },
      });
    });

    if (!order) {
      return {
        success: false,
        reason: "Order not found",
      };
    }

    const rider = await step.run("find-rider", async () => {
      return prisma.deliveryPartner.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          updatedAt: "asc",
        },
      });
    });

    if (!rider) {
      return {
        success: false,
        reason: "No active rider available",
      };
    }

    const otp = await step.run("generate-otp", async () => {
      return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
    });

    const updatedOrder = await step.run("assign-rider", async () => {
      return prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          deliveryPartnerId: rider.id,
          deliveryOtp: otp,
          status: "Shipping",
          statusHistory: [
            ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
            {
              status: "Shipping",
              time: new Date().toISOString(),
              riderId: rider.id,
            },
          ] as any,
        },
      });
    });

    return {
      success: true,
      orderId: updatedOrder.id,
      riderId: rider.id,
      riderName: rider.name,
      otp,
    };
  },
); // Create an empty array where we'll export future Inngest functions
export const functions = [checkLowStock, sendMonthlyOffers,autoAssignRider];
