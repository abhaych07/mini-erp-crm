import { Router } from "express";

import {
    getDashboardOverview,
    getSalesSummary,
    getStockSummary,
    getCustomerSummary
} from "../controllers/dashboard.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
    "/overview",
    authenticate,
    getDashboardOverview
);

router.get(
    "/sales",
    authenticate,
    getSalesSummary
);

router.get(
    "/stock",
    authenticate,
    getStockSummary
);

router.get(
    "/customers",
    authenticate,
    getCustomerSummary
);

export default router;