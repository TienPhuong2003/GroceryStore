import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./route/authRouter.js";
import productRouter from "./route/productRouter.js"
import uploadRouter from "./route/uploadRouter.js";
import orderRouter from "./route/orderRouter.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"


dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Health Check
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running"
    });
});

app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/orders', orderRouter)
app.use("/api/inngest", serve({ client: inngest, functions }));

app.use((error: any, req: Request, res: Response, next: NextFunction)=>{
    console.error()
    res.status(500).json({message: error.message})
})

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});