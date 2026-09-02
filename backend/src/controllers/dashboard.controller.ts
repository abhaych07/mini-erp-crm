import { Response } from "express";
import { Prisma } from "@prisma/client";

import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";


// =====================================================
// DASHBOARD OVERVIEW
// =====================================================

export const getDashboardOverview = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const [
            totalCustomers,
            activeCustomers,
            totalProducts,
            products,
            totalChallans,
            confirmedChallans,
            pendingFollowUps
        ] = await Promise.all([

            prisma.customer.count(),

            prisma.customer.count({
                where: {
                    status: "ACTIVE"
                }
            }),

            prisma.product.count(),

            prisma.product.findMany({
                select: {
                    currentStock: true,
                    minStock: true
                }
            }),

            prisma.salesChallan.count(),

            prisma.salesChallan.count({
                where: {
                    status: "CONFIRMED"
                }
            }),

            prisma.followUp.count({
                where: {
                    followUpDate: {
                        gte: new Date()
                    }
                }
            })

        ]);

        const lowStockProducts = products.filter(
            product => product.currentStock <= product.minStock
        ).length;

        return res.status(200).json({
            success: true,
            data: {
                customers: {
                    total: totalCustomers,
                    active: activeCustomers
                },

                products: {
                    total: totalProducts,
                    lowStock: lowStockProducts
                },

                challans: {
                    total: totalChallans,
                    confirmed: confirmedChallans
                },

                followUps: {
                    pending: pendingFollowUps
                }
            }
        });

    } catch (error) {

        console.error("Dashboard overview error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard overview"
        });
    }
};


// =====================================================
// SALES SUMMARY
// =====================================================

export const getSalesSummary = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const confirmedChallans = await prisma.salesChallan.findMany({
            where: {
                status: "CONFIRMED"
            },
            include: {
                items: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        let totalQuantity = 0;
        let totalSales = new Prisma.Decimal(0);

        for (const challan of confirmedChallans) {

            totalQuantity += challan.totalQuantity;

            for (const item of challan.items) {

                const itemTotal = item.unitPrice.mul(item.quantity);

                totalSales = totalSales.add(itemTotal);
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                totalChallans: confirmedChallans.length,
                totalQuantity,
                totalSales: totalSales.toString()
            }
        });

    } catch (error) {

        console.error("Sales summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch sales summary"
        });
    }
};


// =====================================================
// STOCK SUMMARY
// =====================================================

export const getStockSummary = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const products = await prisma.product.findMany({
            orderBy: {
                currentStock: "asc"
            }
        });

        const totalProducts = products.length;

        const lowStockProducts = products.filter(
            product => product.currentStock <= product.minStock
        );

        const outOfStockProducts = products.filter(
            product => product.currentStock === 0
        );

        const totalStock = products.reduce(
            (sum, product) => sum + product.currentStock,
            0
        );

        return res.status(200).json({
            success: true,
            data: {
                totalProducts,
                totalStock,
                lowStockCount: lowStockProducts.length,
                outOfStockCount: outOfStockProducts.length,

                lowStockProducts: lowStockProducts.map(product => ({
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    currentStock: product.currentStock,
                    minStock: product.minStock,
                    warehouse: product.warehouse
                }))
            }
        });

    } catch (error) {

        console.error("Stock summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch stock summary"
        });
    }
};


// =====================================================
// CUSTOMER & FOLLOW-UP SUMMARY
// =====================================================

export const getCustomerSummary = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const [
            totalCustomers,
            leads,
            active,
            inactive,
            totalFollowUps,
            upcomingFollowUps,
            overdueFollowUps
        ] = await Promise.all([

            prisma.customer.count(),

            prisma.customer.count({
                where: {
                    status: "LEAD"
                }
            }),

            prisma.customer.count({
                where: {
                    status: "ACTIVE"
                }
            }),

            prisma.customer.count({
                where: {
                    status: "INACTIVE"
                }
            }),

            prisma.followUp.count(),

            prisma.followUp.count({
                where: {
                    followUpDate: {
                        gte: new Date()
                    }
                }
            }),

            prisma.followUp.count({
                where: {
                    followUpDate: {
                        lt: new Date()
                    }
                }
            })

        ]);

        return res.status(200).json({
            success: true,
            data: {
                customers: {
                    total: totalCustomers,
                    leads,
                    active,
                    inactive
                },

                followUps: {
                    total: totalFollowUps,
                    upcoming: upcomingFollowUps,
                    overdue: overdueFollowUps
                }
            }
        });

    } catch (error) {

        console.error("Customer summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer summary"
        });
    }
};