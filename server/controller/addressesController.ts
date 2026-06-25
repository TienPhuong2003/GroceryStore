//GET /api/addresses

//POST /api/addresses

//PUT /api/addresses/:id

//DELETE /api/addresses/:id

import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// GET /api/addresses
export const getAddresses = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// POST /api/addresses
export const createAddress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      label,
      address,
      city,
      state,
      zip,
      lat,
      lng,
      isDefault,
    } = req.body;

    if (
      !label ||
      !address ||
      !city ||
      !state ||
      !zip
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const createdAddress = await prisma.$transaction(
      async (tx) => {
        if (isDefault) {
          await tx.address.updateMany({
            where: {
              userId,
            },
            data: {
              isDefault: false,
            },
          });
        }

        return tx.address.create({
          data: {
            userId,
            label,
            address,
            city,
            state,
            zip,
            lat: Number(lat || 0),
            lng: Number(lng || 0),
            isDefault: Boolean(isDefault),
          },
        });
      }
    );

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      address: createdAddress,
    });
  } catch (error) {
    console.error("Create address error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// PUT /api/addresses/:id
export const updateAddress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id ;
    const { id } = req.params as any;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const {
      label,
      address,
      city,
      state,
      zip,
      lat,
      lng,
      isDefault,
    } = req.body;

    const updatedAddress = await prisma.$transaction(
      async (tx) => {
        if (isDefault) {
          await tx.address.updateMany({
            where: {
              userId,
            },
            data: {
              isDefault: false,
            },
          });
        }

        return tx.address.update({
          where: {
            id,
          },
          data: {
            label,
            address,
            city,
            state,
            zip,
            lat:
              lat !== undefined
                ? Number(lat)
                : existingAddress.lat,
            lng:
              lng !== undefined
                ? Number(lng)
                : existingAddress.lng,
            isDefault:
              isDefault !== undefined
                ? Boolean(isDefault)
                : existingAddress.isDefault,
          },
        });
      }
    );

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Update address error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE /api/addresses/:id
export const deleteAddress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params as any;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await prisma.address.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};