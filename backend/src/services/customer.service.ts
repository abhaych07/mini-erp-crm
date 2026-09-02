import prisma from "../config/db";

interface CreateCustomerData {
    name: string;
    mobile: string;
    email?: string;
    businessName: string;
    gstNumber?: string;
    customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
    address: string;
    status?: "LEAD" | "ACTIVE" | "INACTIVE";
    followUpDate?: string;
    notes?: string;
}

export const createCustomer = async (
    data: CreateCustomerData,
    userId: number
) => {

    return await prisma.customer.create({
        data: {
            name: data.name,
            mobile: data.mobile,
            email: data.email || null,
            businessName: data.businessName,
            gstNumber: data.gstNumber || null,
            customerType: data.customerType,
            address: data.address,
            status: data.status || "LEAD",
            followUpDate:
                data.followUpDate
                    ? new Date(data.followUpDate)
                    : null,
            notes: data.notes || null,

            createdById: userId
        }
    });
};


export const getCustomers = async (
    search: string,
    page: number,
    limit: number
) => {

    const skip = (page - 1) * limit;

    const where = search
        ? {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive" as const
                    }
                },
                {
                    mobile: {
                        contains: search,
                        mode: "insensitive" as const
                    }
                },
                {
                    businessName: {
                        contains: search,
                        mode: "insensitive" as const
                    }
                }
            ]
        }
        : {};

    const [customers, total] = await Promise.all([

        prisma.customer.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            }
        }),

        prisma.customer.count({
            where
        })

    ]);

    return {
        customers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};


export const getCustomerById = async (id: number) => {

    return await prisma.customer.findUnique({
        where: {
            id
        },

        include: {
            followUps: {
                orderBy: {
                    followUpDate: "desc"
                }
            },

            challans: {
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    });
};


export const updateCustomer = async (
    id: number,
    data: Partial<CreateCustomerData>
) => {

    return await prisma.customer.update({
        where: {
            id
        },

        data: {
            ...data,

            followUpDate:
                data.followUpDate
                    ? new Date(data.followUpDate)
                    : undefined
        }
    });
};


export const createFollowUp = async (
    customerId: number,
    userId: number,
    note: string,
    followUpDate: string
) => {

    const customer = await prisma.customer.findUnique({
        where: {
            id: customerId
        }
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    const followUp = await prisma.followUp.create({
        data: {
            customerId,
            createdById: userId,
            note,
            followUpDate: new Date(followUpDate)
        }
    });

    // Also update the customer's latest follow-up date
    await prisma.customer.update({
        where: {
            id: customerId
        },

        data: {
            followUpDate: new Date(followUpDate)
        }
    });

    return followUp;
};