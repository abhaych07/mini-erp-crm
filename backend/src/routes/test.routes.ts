import { Router, Response } from "express";

import { authenticate, AuthRequest } from "../middleware/auth.middleware";

import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
    "/protected",

    authenticate,

    (req: AuthRequest, res: Response) => {
        res.json({
            success: true,
            message: "You are authenticated",
            user: req.user
        });
    }
);

router.get(
    "/admin-only",

    authenticate,

    authorize("ADMIN"),

    (req: AuthRequest, res: Response) => {
        res.json({
            success: true,
            message: "Welcome Admin"
        });
    }
);

export default router;