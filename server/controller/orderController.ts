import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { inngest } from "../inngest/index.js";

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { items, shippingAddress, paymentMethod = "cod" } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    const productIds = items.map(
      (item: { productId: string }) => item.productId,
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products not found",
      });
    }

    let subtotal = 0;

    interface OrderItemSnapshot {
      productId: string;
      name: string;
      image: string;
      price: number;
      quantity: number;
      total: number;
    }

    const orderItems: OrderItemSnapshot[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      const stock = product.stock ?? 0;

      if (stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} only has ${stock} items left`,
        });
      }

      const itemTotal = product.price * item.quantity;

      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    const deliveryFee = subtotal >= 500000 ? 0 : 30000;

    const tax = subtotal * 0.1;

    const total = subtotal + deliveryFee + tax;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          items: orderItems as any,
          shippingAddress,
          paymentMethod,
          subtotal,
          deliveryFee,
          tax,
          total,
          status: "Placed",
          statusHistory: [
            {
              status: "Placed",
              time: new Date().toISOString(),
            },
          ],
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      
      return createdOrder;
    });

    
    await inngest.send({
      name: "order/created",
      data: {
        orderId: order.id,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get user's order
//GET /api/orders
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//GET /api/orders/:id
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as any;

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        deliveryPartner: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isOwner = order.userId === req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//update order status (admin)
//PUT /api/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    const { id } = req.params as any;
    const { status } = req.body;

    const VALID_STATUS = [
      "Placed",
      "Confirmed",
      "Preparing",
      "Shipping",
      "Delivered",
      "Cancelled",
    ];

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
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
        status,
        statusHistory: [
          ...history,
          {
            status,
            time: new Date().toISOString(),
          },
        ] as any,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//GET /api/orders/all
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        deliveryPartner: true,
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
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//Get Order Location
//GET /api/orders/:id/location
export const getOrderLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as any;

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        liveLocation: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isOwner = order.userId === req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return res.status(200).json({
      success: true,
      orderId: order.id,
      status: order.status,
      location: order.liveLocation,
    });
  } catch (error) {
    console.error("Get order location error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
