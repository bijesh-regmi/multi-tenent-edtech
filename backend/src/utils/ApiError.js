/**
 * Custom API Error Class
 * Provides consistent error structure across the application
 */
class ApiError extends Error {

    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        code = null,
        stack = ""
    ) {
        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;
        this.code = code; // Machine-readable error code

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

}

export default ApiError;
