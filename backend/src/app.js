import express from "express";
import authRouter from "./routes/global/auth.routes.js";
import instituteRoute from "./routes/institute/institute.route.js"
import ApiError from "./utils/ApiError.js";

const app = express();

// Security Headers (Helmet)
// app.use(helmet());
// General Rate Limiting (applies to all routes)
// app.use(generalLimiter);


app.use(express.json({ limit: '10kb' })); // Limit body size for security
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
console.log("hello")
// API Routes
app.use("/api/v1/user", authRouter);
app.use("/api/v1/institute",instituteRoute)

app.get("/hello",(req,res)=>{

    console.log("hello")
    res.status(200).json("hello")
})





// 404 Handler - Must be after all routes, before error handler
app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Global Error Handler - Must be last middleware
// app.use(globalErrorHandler);

// Handle unhandled promise rejections at the app level
process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION] at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[UNCAUGHT EXCEPTION]:', error);
    // Give the server a chance to finish current requests, then exit
    process.exit(1);
});

export default app;
