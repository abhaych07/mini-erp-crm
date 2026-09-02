import { Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

/*
|--------------------------------------------------------------------------
| CREATE DRAFT CHALLAN
|--------------------------------------------------------------------------
*/

export const createChallan = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        const { customerId, challanNumber } = req.body;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Customer ID is required"
            });
        }

        const customer = await prisma.customer.findUnique({
            where: {
                id: Number(customerId)
            }
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        let finalChallanNumber = challanNumber;

        if (!finalChallanNumber) {
            const count = await prisma.salesChallan.count();

            finalChallanNumber = `CH-${String(count + 1).padStart(5, "0")}`;
        }

        const existingChallan = await prisma.salesChallan.findUnique({
            where: {
                challanNumber: finalChallanNumber
            }
        });

        if (existingChallan) {
            return res.status(409).json({
                success: false,
                message: "Challan number already exists"
            });
        }

        const challan = await prisma.salesChallan.create({
            data: {
                challanNumber: finalChallanNumber,
                customerId: Number(customerId),
                createdById: userId,
                status: "DRAFT"
            },
            include: {
                customer: true,
                items: true
            }
        });

        return res.status(201).json({
            success: true,
            message: "Sales challan created successfully",
            data: challan
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create sales challan"
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET ALL CHALLANS
|--------------------------------------------------------------------------
*/

export const getChallans = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(Number(req.query.limit) || 10, 1),
            100
        );

        const skip = (page - 1) * limit;

        const [challans, total] = await Promise.all([
            prisma.salesChallan.findMany({
                skip,
                take: limit,

                orderBy: {
                    createdAt: "desc"
                },

                include: {
                    customer: true,
                    items: true
                }
            }),

            prisma.salesChallan.count()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                challans,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch challans"
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET CHALLAN BY ID
|--------------------------------------------------------------------------
*/

export const getChallanById = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        const challan = await prisma.salesChallan.findUnique({
            where: {
                id
            },

            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!challan) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: challan
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch challan"
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADD ITEM TO DRAFT CHALLAN
|--------------------------------------------------------------------------
*/

export const addChallanItem = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const challanId = Number(req.params.id);

        const {
            productId,
            quantity
        } = req.body;

        if (!Number.isInteger(challanId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        const productIdNumber = Number(productId);
        const quantityNumber = Number(quantity);

        if (!Number.isInteger(productIdNumber)) {
            return res.status(400).json({
                success: false,
                message: "Valid product ID is required"
            });
        }

        if (
            !Number.isInteger(quantityNumber) ||
            quantityNumber <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const challan = await prisma.salesChallan.findUnique({
            where: {
                id: challanId
            }
        });

        if (!challan) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        if (challan.status !== "DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Items can only be added to a draft challan"
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productIdNumber
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.currentStock < quantityNumber) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available stock: ${product.currentStock}`
            });
        }

        const existingItem =
            await prisma.salesChallanItem.findFirst({
                where: {
                    challanId,
                    productId: productIdNumber
                }
            });

        let item;

        if (existingItem) {

            const newQuantity =
                existingItem.quantity + quantityNumber;

            if (product.currentStock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock. Available stock: ${product.currentStock}`
                });
            }

            item = await prisma.salesChallanItem.update({
                where: {
                    id: existingItem.id
                },

                data: {
                    quantity: newQuantity
                }
            });

        } else {

            item = await prisma.salesChallanItem.create({
                data: {
                    challanId,
                    productId: productIdNumber,
                    quantity: quantityNumber,

                    // Product snapshot
                    productName: product.name,
                    sku: product.sku,
                    unitPrice: product.unitPrice
                }
            });
        }

        const totalQuantity =
            await prisma.salesChallanItem.aggregate({
                where: {
                    challanId
                },

                _sum: {
                    quantity: true
                }
            });

        const updatedChallan =
            await prisma.salesChallan.update({
                where: {
                    id: challanId
                },

                data: {
                    totalQuantity:
                        totalQuantity._sum.quantity || 0
                },

                include: {
                    customer: true,
                    items: true
                }
            });

        return res.status(201).json({
            success: true,
            message: "Item added to challan successfully",
            data: updatedChallan
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to add item to challan"
        });
    }
};


/*
|--------------------------------------------------------------------------
| CONFIRM CHALLAN
|--------------------------------------------------------------------------
*/

export const confirmChallan = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const challanId = Number(req.params.id);
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        if (!Number.isInteger(challanId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        const result = await prisma.$transaction(
            async (tx) => {

                const challan =
                    await tx.salesChallan.findUnique({
                        where: {
                            id: challanId
                        },

                        include: {
                            items: true
                        }
                    });

                if (!challan) {
                    throw new Error("CHALLAN_NOT_FOUND");
                }

                if (challan.status !== "DRAFT") {
                    throw new Error("CHALLAN_NOT_DRAFT");
                }

                if (challan.items.length === 0) {
                    throw new Error("CHALLAN_EMPTY");
                }

                /*
                |--------------------------------------------------------------------------
                | Check stock for every item
                |--------------------------------------------------------------------------
                */

                for (const item of challan.items) {

                    const product =
                        await tx.product.findUnique({
                            where: {
                                id: item.productId
                            }
                        });

                    if (!product) {
                        throw new Error(
                            `PRODUCT_NOT_FOUND_${item.productId}`
                        );
                    }

                    if (
                        product.currentStock <
                        item.quantity
                    ) {
                        throw new Error(
                            `INSUFFICIENT_STOCK_${product.name}_${product.currentStock}`
                        );
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | Deduct stock
                |--------------------------------------------------------------------------
                */

                for (const item of challan.items) {

                    const product =
                        await tx.product.findUnique({
                            where: {
                                id: item.productId
                            }
                        });

                    if (!product) {
                        throw new Error(
                            `PRODUCT_NOT_FOUND_${item.productId}`
                        );
                    }

                    await tx.product.update({
                        where: {
                            id: item.productId
                        },

                        data: {
                            currentStock: {
                                decrement: item.quantity
                            }
                        }
                    });

                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            quantity: item.quantity,
                            type: "OUT",
                            reason: `Sales Challan ${challan.challanNumber}`,
                            createdById: userId
                        }
                    });
                }

                /*
                |--------------------------------------------------------------------------
                | Confirm challan
                |--------------------------------------------------------------------------
                */

                const confirmedChallan =
                    await tx.salesChallan.update({
                        where: {
                            id: challanId
                        },

                        data: {
                            status: "CONFIRMED"
                        },

                        include: {
                            customer: true,
                            items: true
                        }
                    });

                return confirmedChallan;
            }
        );

        return res.status(200).json({
            success: true,
            message: "Sales challan confirmed successfully",
            data: result
        });

    } catch (error: any) {

        console.error(error);

        if (error.message === "CHALLAN_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        if (error.message === "CHALLAN_NOT_DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Only draft challans can be confirmed"
            });
        }

        if (error.message === "CHALLAN_EMPTY") {
            return res.status(400).json({
                success: false,
                message: "Cannot confirm an empty challan"
            });
        }

        if (
            error.message.startsWith("INSUFFICIENT_STOCK_")
        ) {
            const parts =
                error.message.split("_");

            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${parts[1]}. Available stock: ${parts[2]}`
            });
        }

        if (
            error.message.startsWith("PRODUCT_NOT_FOUND_")
        ) {
            return res.status(404).json({
                success: false,
                message: "Product in challan no longer exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to confirm challan"
        });
    }
};


/*
|--------------------------------------------------------------------------
| CANCEL CHALLAN
|--------------------------------------------------------------------------
*/

export const cancelChallan = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const challanId = Number(req.params.id);

        if (!Number.isInteger(challanId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        const challan =
            await prisma.salesChallan.findUnique({
                where: {
                    id: challanId
                }
            });

        if (!challan) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        if (challan.status !== "DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Only draft challans can be cancelled"
            });
        }

        const cancelledChallan =
            await prisma.salesChallan.update({
                where: {
                    id: challanId
                },

                data: {
                    status: "CANCELLED"
                },

                include: {
                    customer: true,
                    items: true
                }
            });

        return res.status(200).json({
            success: true,
            message: "Sales challan cancelled successfully",
            data: cancelledChallan
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel challan"
        });
    }
};