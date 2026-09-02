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

router.post(
    "/",
    authenticate,
    createChallan
);

router.get(
    "/",
    authenticate,
    getChallans
);

router.get(
    "/:id",
    authenticate,
    getChallanById
);

router.post(
    "/:id/items",
    authenticate,
    addChallanItem
);

router.put(
    "/:id/confirm",
    authenticate,
    confirmChallan
);

router.put(
    "/:id/cancel",
    authenticate,
    cancelChallan
);

export default router;