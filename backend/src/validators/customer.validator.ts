import { z } from "zod";

export const createCustomerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),

    mobile: z
        .string()
        .min(10, "Mobile number must be at least 10 digits")
        .max(15, "Mobile number is too long"),

    email: z
        .string()
        .email("Invalid email")
        .optional()
        .or(z.literal("")),

    businessName: z
        .string()
        .min(2, "Business name is required"),

    gstNumber: z
        .string()
        .optional()
        .or(z.literal("")),

    customerType: z.enum([
        "RETAIL",
        "WHOLESALE",
        "DISTRIBUTOR"
    ]),

    address: z
        .string()
        .min(5, "Address is required"),

    status: z
        .enum([
            "LEAD",
            "ACTIVE",
            "INACTIVE"
        ])
        .optional(),

    followUpDate: z
        .string()
        .datetime()
        .optional()
        .or(z.literal("")),

    notes: z
        .string()
        .optional()
});

export const updateCustomerSchema =
    createCustomerSchema.partial();

export const followUpSchema = z.object({
    note: z
        .string()
        .min(1, "Follow-up note is required"),

    followUpDate: z
        .string()
        .datetime("Invalid follow-up date")
});