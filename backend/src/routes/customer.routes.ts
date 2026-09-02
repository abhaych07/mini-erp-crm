import { Router } from "express";

import {
    createCustomerController,
    getCustomersController,
    getCustomerController,
    updateCustomerController,
    createFollowUpController
} from "../controllers/customer.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

import { validate } from "../middleware/validate.middleware";

import {
    createCustomerSchema,
    updateCustomerSchema,
    followUpSchema
} from "../validators/customer.validator";


const router = Router();


// Create customer
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SALES"),
    validate(createCustomerSchema),
    createCustomerController
);


// Get customers
router.get(
    "/",
    authenticate,
    getCustomersController
);


// Get customer details
router.get(
    "/:id",
    authenticate,
    getCustomerController
);


// Update customer
router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "SALES"),
    validate(updateCustomerSchema),
    updateCustomerController
);


// Add follow-up
router.post(
    "/:id/follow-ups",
    authenticate,
    authorize("ADMIN", "SALES"),
    validate(followUpSchema),
    createFollowUpController
);


export default router;