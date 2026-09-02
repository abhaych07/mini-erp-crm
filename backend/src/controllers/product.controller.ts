import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../config/db";
export const createProduct = async (req: Request, res: Response) => {
    try {
        const {
            name,
            sku,
            category,
            unitPrice,
            currentStock = 0,
            minStock = 0,
            warehouse
        } = req.body;

        if (
            !name ||
            !sku ||
            !category ||
            unitPrice === undefined ||
            !warehouse
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, SKU, category, unit price and warehouse are required"
            });
        }

        const price = Number(unitPrice);
        const stock = Number(currentStock);
        const minimumStock = Number(minStock);

        if (isNaN(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Unit price must be a valid non-negative number"
            });
        }

        if (!Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Current stock must be a non-negative integer"
            });
        }

        if (!Number.isInteger(minimumStock) || minimumStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Minimum stock must be a non-negative integer"
            });
        }

        const existingProduct = await prisma.product.findUnique({
            where: { sku }
        });

        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: "Product with this SKU already exists"
            });
        }

        const product = await prisma.product.create({
            data: {
                name,
                sku,
                category,
                unitPrice: new Prisma.Decimal(price),
                currentStock: stock,
                minStock: minimumStock,
                warehouse
            }
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
        console.error("Create product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create product"
        });
    }
};


export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

        const category =
            typeof req.query.category === "string"
                ? req.query.category.trim()
                : "";

        const lowStock = req.query.lowStock === "true";

        const where: Prisma.ProductWhereInput = {};

        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    sku: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    category: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ];
        }

        if (category) {
            where.category = {
                equals: category,
                mode: "insensitive"
            };
        }

        if (lowStock) {
            where.currentStock = {
                lte: 0
            };
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc"
                }
            }),

            prisma.product.count({
                where
            })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};


export const getProductById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await prisma.product.findUnique({
            where: { id },

            include: {
                stockMovements: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                }
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error("Get product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
};


export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id }
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const {
            name,
            sku,
            category,
            unitPrice,
            minStock,
            warehouse
        } = req.body;

        const data: Prisma.ProductUpdateInput = {};

        if (name !== undefined) {
            if (!String(name).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name cannot be empty"
                });
            }

            data.name = name;
        }

        if (sku !== undefined) {
            if (!String(sku).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "SKU cannot be empty"
                });
            }

            const duplicate = await prisma.product.findFirst({
                where: {
                    sku,
                    NOT: {
                        id
                    }
                }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "Another product already uses this SKU"
                });
            }

            data.sku = sku;
        }

        if (category !== undefined) {
            data.category = category;
        }

        if (unitPrice !== undefined) {
            const price = Number(unitPrice);

            if (isNaN(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Unit price must be a valid non-negative number"
                });
            }

            data.unitPrice = new Prisma.Decimal(price);
        }

        if (minStock !== undefined) {
            const minimumStock = Number(minStock);

            if (!Number.isInteger(minimumStock) || minimumStock < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Minimum stock must be a non-negative integer"
                });
            }

            data.minStock = minimumStock;
        }

        if (warehouse !== undefined) {
            data.warehouse = warehouse;
        }

        const product = await prisma.product.update({
            where: { id },
            data
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {
        console.error("Update product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
};