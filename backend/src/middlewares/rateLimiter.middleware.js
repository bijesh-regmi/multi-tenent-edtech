// import rateLimit from 'express-rate-limit';

// /**
//  * Rate Limiting Middleware
//  * Protects against brute force attacks, account enumeration, and DoS attacks
//  */

// /**
//  * General API rate limiter
//  * Applies to all routes
//  * 100 requests per 15 minutes per IP
//  */
// export const generalLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per windowMs
//     message: {
//         success: false,
//         message: 'Too many requests from this IP, please try again after 15 minutes.',
//         code: 'RATE_LIMIT_EXCEEDED',
//     },
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//     handler: (req, res, next, options) => {
//         res.status(429).json(options.message);
//     },
// });

// /**
//  * Strict auth rate limiter for login/signup endpoints
//  * 5 requests per minute per IP
//  */
// export const authLimiter = rateLimit({
//     windowMs: 60 * 1000, // 1 minute
//     max: 5, // Limit each IP to 5 requests per minute
//     message: {
//         success: false,
//         message: 'Too many authentication attempts, please try again after 1 minute.',
//         code: 'AUTH_RATE_LIMIT_EXCEEDED',
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     handler: (req, res, next, options) => {
//         res.status(429).json(options.message);
//     },
//     skipSuccessfulRequests: false, // Count all requests, not just failed ones
// });

// /**
//  * Password reset rate limiter
//  * 3 requests per hour per IP
//  */
// export const passwordResetLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour
//     max: 3, // Limit each IP to 3 requests per hour
//     message: {
//         success: false,
//         message: 'Too many password reset requests, please try again after 1 hour.',
//         code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     handler: (req, res, next, options) => {
//         res.status(429).json(options.message);
//     },
// });

// /**
//  * Login attempt limiter (stricter for security)
//  * 10 attempts per 15 minutes per IP
//  */
// export const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 10, // Limit each IP to 10 login attempts per 15 minutes
//     message: {
//         success: false,
//         message: 'Too many login attempts, please try again after 15 minutes.',
//         code: 'LOGIN_RATE_LIMIT_EXCEEDED',
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     handler: (req, res, next, options) => {
//         res.status(429).json(options.message);
//     },
//     skipSuccessfulRequests: true, // Only count failed requests
// });

// /**
//  * Account creation rate limiter
//  * 5 signups per hour per IP (prevents mass account creation)
//  */
// export const signupLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour
//     max: 5, // Limit each IP to 5 signups per hour
//     message: {
//         success: false,
//         message: 'Too many accounts created from this IP, please try again after 1 hour.',
//         code: 'SIGNUP_RATE_LIMIT_EXCEEDED',
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     handler: (req, res, next, options) => {
//         res.status(429).json(options.message);
//     },
// });

// export default {
//     generalLimiter,
//     authLimiter,
//     passwordResetLimiter,
//     loginLimiter,
//     signupLimiter,
// };
