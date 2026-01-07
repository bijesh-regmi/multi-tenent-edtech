import ApiError from "../utils/ApiError.js";
const globalErrorHandler = (err, req, res, next) => {

    if(err instanceof ApiError){
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error:err.error ?? null,
        })
    }
    //fallback for unhandled errors
    res.status(500).json({
        success: false,
        message: err.message || "Something went wrong, unhandled error occurred.",
        error: err.errors ?? null,
    });
};

export default globalErrorHandler;
