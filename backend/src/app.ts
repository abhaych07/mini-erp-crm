import express from "express";
import cors from "cors";

import authRoutes from "./auth/auth.routes";
import testRoutes from "./routes/test.routes";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import challanRoutes from "./routes/challan.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

app.use(cors());

app.use(express.json());


app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Mini ERP CRM API is running"
    });
});


app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;