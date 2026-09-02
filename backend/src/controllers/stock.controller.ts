import { Request, Response } from "express";
import prisma from "../config/db";
export const createStockMovement = async (
    req: Request,
    res: Response
) => {
    try {
        const productId = Number(req.params.id);

        const {
            quantity,
            type,
            reason
        } = req.body;

        // Change this if your auth middleware stores the user differently.
        const userId = (req as any).user?.userId;
        if (!Number.isInteger(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        const amount = Number(quantity);

        if (!Number.isInteger(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        if (type !== "IN" && type !== "OUT") {
            return res.status(400).json({
                success: false,
                message: "Movement type must be IN or OUT"
            });
        }

        if (!reason || !String(reason).trim()) {
            return res.status(400).json({
                success: false,
                message: "Reason is required"
            });
        }

        const result = await prisma.$transaction(async (tx) => {

            const product = await tx.product.findUnique({
                where: {
                    id: productId
                }
            });

            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }

            let newStock = product.currentStock;

            if (type === "IN") {
                newStock += amount;
            } else {

                if (product.currentStock < amount) {
                    throw new Error("INSUFFICIENT_STOCK");
                }

                newStock -= amount;
            }

            const updatedProduct = await tx.product.update({
                where: {
                    id: productId
                },
                data: {
                    currentStock: newStock
                }
            });

            const movement = await tx.stockMovement.create({
                data: {
                    productId,
                    quantity: amount,
                    type,
                    reason,
                    createdById: userId
                }
            });

            return {
                updatedProduct,
                movement
            };
        });

        return res.status(201).json({
            success: true,
            message: `Stock ${type === "IN" ? "added" : "removed"} successfully`,
            data: result
        });

    } catch (error: any) {

        if (error.message === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (error.message === "INSUFFICIENT_STOCK") {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        console.error("Stock movement error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update stock"
        });
    }
};


export const getStockMovements = async (
    req: Request,
    res: Response
) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const movements = await prisma.stockMovement.findMany({
            where: {
                productId
            },
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
        });

        return res.status(200).json({
            success: true,
            data: {
                product,
                movements
            }
        });

    } catch (error) {
        console.error("Get stock movements error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch stock movements"
        });
    }
};