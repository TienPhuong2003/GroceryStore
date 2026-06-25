//get admin dashboard data
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { Request, Response } from "express";


export const getDashboardData = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalRiders,
      orders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.deliveryPartner.count(),
      prisma.order.findMany(),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status === "Delivered")
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter(
      (o) => o.status !== "Delivered"
    ).length;

    return res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRiders,
        totalRevenue,
        pendingOrders,
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
//get delivery partner
export const getDeliveryPartners = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    const riders = await prisma.deliveryPartner.findMany({
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      riders,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//create profile delivery partner


export const createDeliveryPartner = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    const {
      name,
      email,
      password,
      phone,
      avatar,
      vehicleType,
    } = req.body;

    const exists =
      await prisma.deliveryPartner.findUnique({
        where: {
          email,
        },
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const rider =
      await prisma.deliveryPartner.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          avatar,
          vehicleType,
        },
      });

    return res.status(201).json({
      success: true,
      rider,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//update delivery partner profile
export const updateDeliveryPartner = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    const { id } = req.params as any;

    const rider =
      await prisma.deliveryPartner.findUnique({
        where: { id },
      });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    const updated =
      await prisma.deliveryPartner.update({
        where: {
          id,
        },
        data: {
          name: req.body.name,
          phone: req.body.phone,
          avatar: req.body.avatar,
          vehicleType: req.body.vehicleType,
          isActive: req.body.isActive,
        },
      });

    return res.status(200).json({
      success: true,
      rider: updated,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//assign delivery for order
export const assignDeliveryForOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    const { orderId } = req.params as any;
    const { riderId } = req.body as any;

    const [order, rider] = await Promise.all([
      prisma.order.findUnique({
        where: {
          id: orderId,
        },
      }),
      prisma.deliveryPartner.findUnique({
        where: {
          id: riderId,
        },
      }),
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    const otp = String(
      Math.floor(Math.random() * 1000000)
    ).padStart(6, "0");

    const history = Array.isArray(
      order.statusHistory
    )
      ? order.statusHistory
      : [];

    const updatedOrder =
      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          deliveryPartnerId: rider.id,
          deliveryOtp: otp,
          status: "Shipping",
          statusHistory: [
            ...history,
            {
              status: "Shipping",
              riderId: rider.id,
              riderName: rider.name,
              time: new Date().toISOString(),
            },
          ] as any,
        },
      });

    return res.status(200).json({
      success: true,
      message: "Rider assigned successfully",
      otp,
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