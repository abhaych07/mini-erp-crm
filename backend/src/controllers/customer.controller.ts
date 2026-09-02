import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    createFollowUp
} from "../services/customer.service";


export const createCustomerController = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const userId = req.user!.userId;

        const customer = await createCustomer(
            req.body,
            userId
        );

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create customer"
        });
    }
};


export const getCustomersController = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : "";

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const result = await getCustomers(
            search,
            page,
            limit
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customers"
        });
    }
};


export const getCustomerController = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const id = Number(req.params.id);

        const customer = await getCustomerById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: customer
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer"
        });
    }
};


export const updateCustomerController = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const id = Number(req.params.id);

        const customer = await updateCustomer(
            id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer
        });

    } catch (error) {

        console.error(error);

        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }
};


export const createFollowUpController = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const customerId =
            Number(req.params.id);

        const userId =
            req.user!.userId;

        const { note, followUpDate } =
            req.body;

        const followUp =
            await createFollowUp(
                customerId,
                userId,
                note,
                followUpDate
            );

        return res.status(201).json({
            success: true,
            message: "Follow-up added successfully",
            data: followUp
        });

    } catch (error) {

        console.error(error);

        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }
};