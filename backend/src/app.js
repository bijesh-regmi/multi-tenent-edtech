import express from "express";
import authRouter from "./routes/global/auth.routes.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//
app.use("/api/v1/user", authRouter);
app.use(globalErrorHandler)
export default app;
