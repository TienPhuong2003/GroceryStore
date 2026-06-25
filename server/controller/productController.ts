import { prisma } from "../config/prisma.js";
import { Request, Response } from "express";
import { inngest } from "../inngest/index.js";

export const getFlashDeals = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: {
          gt: 0,
        },
      },
      take: 50,
    });

    const flashDeals = products
      .map((product) => ({
        ...product,
        discount:
          product.originalPrice && product.originalPrice > product.price
            ? Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100,
              )
            : 0,
      }))
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 8);

    return res.status(200).json({
      success: true,
      products: flashDeals,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const discount =
      product.originalPrice && product.originalPrice > product.price
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100,
          )
        : 0;

    const relatedProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        NOT: {
          id: product.id,
        },
      },
      take: 4,
    });

    return res.status(200).json({
      success: true,
      product: {
        ...product,
        discount,
      },
      relatedProducts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const category = req.params.category as string;

    const products = await prisma.product.findMany({
      where: {
        category,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 20,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      unit,
      stock,
      isOrganic,
    } = req.body;

    if (!name || !price || !image || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        image,
        category,
        unit,
        stock: Number(stock || 0),
        isOrganic,
      },
    });

    if ((product.stock ?? 0) < 10) {
      await inngest.send({
        name: "inventory/stock.update",
        data: {
          productId: product.id,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProduct = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      unit,
      stock,
      isOrganic,
    } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,

        price: price !== undefined ? Number(price) : existingProduct.price,

        originalPrice:
          originalPrice !== undefined
            ? Number(originalPrice)
            : existingProduct.originalPrice,

        image,
        category,
        unit,

        stock: stock !== undefined ? Number(stock) : existingProduct.stock,

        isOrganic,
      },
    });

    // Nếu stock thay đổi thì gửi event
    if (stock !== undefined && Number(stock) !== existingProduct.stock) {
      await inngest.send({
        name: "inventory/stock.update",
        data: {
          productId: updatedProduct.id,
          stock: updatedProduct.stock,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const sort = req.query.sort as string;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category) {
      where.category = category;
    }

    let orderBy: any = {
      createdAt: "desc",
    };

    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;

      case "price_desc":
        orderBy = { price: "desc" };
        break;

      case "name_asc":
        orderBy = { name: "asc" };
        break;

      case "name_desc":
        orderBy = { name: "desc" };
        break;

      default:
        orderBy = { createdAt: "desc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({
        where,
      }),
    ]);

    const result = products.map((product) => ({
      ...product,
      discount:
        product.originalPrice && product.originalPrice > product.price
          ? Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100,
            )
          : 0,
    }));

    return res.status(200).json({
      success: true,
      products: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
