import { Router } from "express";

import {
    createChallan,
    getChallans,
    getChallanById,
    addChallanItem,
    confirmChallan,
    cancelChallan
} from "../controllers/challan.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();


/*
|--------------------------------------------------------------------------
| CHALLAN ROUTES
|--------------------------------------------------------------------------
*/

// Create draft challan
router.post(
    "/",
    authenticate,
    createChallan
);

// Get all challans
router.get(
    "/",
    authenticate,
    getChallans
);

// Get challan by ID
router.get(
    "/:id",
    authenticate,
    getChallanById
);

// Add product/item to challan
router.post(
    "/:id/items",
    authenticate,
    addChallanItem
);

// Confirm challan
router.put(
    "/:id/confirm",
    authenticate,
    confirmChallan
);

// Cancel challan
router.put(
    "/:id/cancel",
    authenticate,
    cancelChallan
);

export default router;