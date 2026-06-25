import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
const deliAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string
      role: string;
    };
    if (decoded.role !== "DELIVERY") {
      return res.status(403).json({ message: "Access denied. Delivery only" });
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id: decoded.id },
    });
    if (!partner || !partner.isActive) {
      return res.status(403).json({ message: "Account is deactivate" });
    }
    (req as any).partner = partner;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "token not valid" });
  }
};

export default deliAuth
