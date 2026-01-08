// import ApiError from "../utils/ApiError.js";
// import {
//     sanitizeError,
//     isSequelizeError,
//     getSequelizeErrorStatusCode,
//     extractSequelizeValidationErrors,
// } from "../utils/errorSanitizer.js";

// /**
//  * Global Error Handler Middleware
//  * Handles all errors consistently and securely
//  */
// const globalErrorHandler = (err, req, res, next) => {
//     // Determine if we're in development mode
//     const isDevelopment = process.env.NODE_ENV === 'development';

//     // Always set JSON content type
//     res.setHeader('Content-Type', 'application/json');

//     // Log error server-side (always)
//     console.error(`[ERROR] ${new Date().toISOString()}:`, {
//         message: err.message,
//         stack: isDevelopment ? err.stack : undefined,
//         url: req.originalUrl,
//         method: req.method,
//         ip: req.ip,
//     });

//     // Handle known ApiError instances
//     if (err instanceof ApiError) {
//         return res.status(err.statusCode).json({
//             success: false,
//             message: err.message,
//             errors: isDevelopment ? (err.errors || []) : [],
//             code: err.code || undefined,
//         });
//     }

//     // Handle Sequelize Validation Errors
//     if (err.name === 'SequelizeValidationError') {
//         const safeErrors = extractSequelizeValidationErrors(err);
//         return res.status(400).json({
//             success: false,
//             message: 'Validation failed',
//             errors: safeErrors,
//             code: 'VALIDATION_ERROR',
//         });
//     }

//     // Handle Sequelize Unique Constraint Errors
//     if (err.name === 'SequelizeUniqueConstraintError') {
//         const fields = err.errors?.map(e => e.path).filter(Boolean) || [];
//         return res.status(409).json({
//             success: false,
//             message: fields.length > 0
//                 ? `${fields.join(', ')} already exists`
//                 : 'A record with this value already exists',
//             errors: [],
//             code: 'DUPLICATE_ENTRY',
//         });
//     }

//     // Handle other Sequelize errors
//     if (isSequelizeError(err)) {
//         const statusCode = getSequelizeErrorStatusCode(err);
//         return res.status(statusCode).json({
//             success: false,
//             message: isDevelopment
//                 ? err.message
//                 : 'A database error occurred. Please try again later.',
//             errors: [],
//             code: 'DATABASE_ERROR',
//         });
//     }

//     // Handle JWT errors
//     if (err.name === 'JsonWebTokenError') {
//         return res.status(401).json({
//             success: false,
//             message: 'Invalid token',
//             errors: [],
//             code: 'INVALID_TOKEN',
//         });
//     }

//     if (err.name === 'TokenExpiredError') {
//         return res.status(401).json({
//             success: false,
//             message: 'Token has expired',
//             errors: [],
//             code: 'TOKEN_EXPIRED',
//         });
//     }

//     // Handle JSON parsing errors (malformed JSON in request body)
//     if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid JSON in request body',
//             errors: [],
//             code: 'INVALID_JSON',
//         });
//     }

//     // Fallback for unhandled/unknown errors
//     const sanitized = sanitizeError(err, isDevelopment);
//     res.status(err.statusCode || 500).json({
//         success: false,
//         message: sanitized.message,
//         errors: sanitized.errors,
//         code: 'INTERNAL_ERROR',
//         // Include stack trace only in development
//         ...(isDevelopment && { stack: sanitized.stack }),
//     });
// };

// export default globalErrorHandler;
