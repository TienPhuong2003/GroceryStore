
import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateDeliveryToken = (
  id: string,
  email: string,
) => {
  return jwt.sign(
    {
      id,
      email,
      role: "DELIVERY",
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "30d",
    },
  );
};

// POST /api/delivery/login
export const loginDeliveryPartner = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, password } = req.body;

    const rider = await prisma.deliveryPartner.findUnique({
      where: {
        email,
      },
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      rider.password,
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateDeliveryToken(
      rider.id,
      rider.email,
    );

    return res.status(200).json({
      success: true,
      token,
      rider: {
        id: rider.id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        avatar: rider.avatar,
        vehicleType: rider.vehicleType,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//GET /api/delivery/my-deliveries
// GET /api/delivery/my-deliveries

export const getMyDeliveries = async (
  req: any,
  res: Response,
) => {
  try {
    const riderId = req.delivery?.id;

    const orders = await prisma.order.findMany({
      where: {
        deliveryPartnerId: riderId,
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//GET /api/delivery/my-deliveries/:id
// GET /api/delivery/my-deliveries/:id

export const getMyDeliveryById = async (
  req: any,
  res: Response,
) => {
  try {
    const riderId = req.delivery?.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        deliveryPartnerId: riderId,
      },
      include: {
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//PUT /api/delivery/my-deliveries/:id/complete
// PUT /api/delivery/my-deliveries/:id/complete

export const completeDelivery = async (
  req: any,
  res: Response,
) => {
  try {
    const riderId = req.delivery?.id;
    const { id } = req.params;
    const { otp } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id,
        deliveryPartnerId: riderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const history = Array.isArray(order.statusHistory)
      ? order.statusHistory
      : [];

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: "Delivered",
        statusHistory: [
          ...history,
          {
            status: "Delivered",
            time: new Date().toISOString(),
          },
        ] as any,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order delivered successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//PUT /api/delivery/my-deliveries/:id/cancel
// PUT /api/delivery/my-deliveries/:id/cancel

export const cancelDelivery = async (
  req: any,
  res: Response,
) => {
  try {
    const riderId = req.delivery?.id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id,
        deliveryPartnerId: riderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const history = Array.isArray(order.statusHistory)
      ? order.statusHistory
      : [];

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: "Cancelled",
        statusHistory: [
          ...history,
          {
            status: "Cancelled",
            reason,
            time: new Date().toISOString(),
          },
        ] as any,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//PUT /api/delivery/my-deliveries/:id/status
// PUT /api/delivery/my-deliveries/:id/status

export const updateDeliveryStatus = async (
  req: any,
  res: Response,
) => {
  try {
    const riderId = req.delivery?.id;
    const { id } = req.params;
    const { status } = req.body;

    const ALLOWED_STATUS = [
      "Packed",
      "Out For Delivery",
    ];

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Packed or Out For Delivery",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        deliveryPartnerId: riderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.status === "Delivered" ||
      order.status === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order already completed",
      });
    }

    const history = Array.isArray(order.statusHistory)
      ? order.statusHistory
      : [];

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
        statusHistory: [
          ...history,
          {
            status,
            time: new Date().toISOString(),
            updatedBy: "DELIVERY_PARTNER",
            riderId,
          },
        ] as any,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update delivery status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//PUT /api/delivery/my-deliveries/:id/location

export const updateDeliveryLocation = async (
  req: any,
  res: Response,
) => {
  try {
    const riderId = req.delivery?.id;
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (
      lat === undefined ||
      lng === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        deliveryPartnerId: riderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.status === "Delivered" ||
      order.status === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order already completed",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        liveLocation: {
          lat: Number(lat),
          lng: Number(lng),
          updatedAt: new Date().toISOString(),
        } as any,
      },
      select: {
        id: true,
        status: true,
        liveLocation: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update location error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};