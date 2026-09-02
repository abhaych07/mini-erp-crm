import { Router } from "express";

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct
} from "../controllers/product.controller";

import {
    createStockMovement,
    getStockMovements
} from "../controllers/stock.controller";

// IMPORTANT:
// Change this import ONLY if your existing auth middleware
// has a different filename.
import { authenticate } from "../middleware/auth.middleware";

const router = Router();


// Product APIs

router.post(
    "/",
    authenticate,
    createProduct
);

router.get(
    "/",
    authenticate,
    getProducts
);

router.get(
    "/:id",
    authenticate,
    getProductById
);

router.put(
    "/:id",
    authenticate,
    updateProduct
);


// Stock APIs

router.post(
    "/:id/stock",
    authenticate,
    createStockMovement
);

router.get(
    "/:id/stock-movements",
    authenticate,
    getStockMovements
);

export default router;