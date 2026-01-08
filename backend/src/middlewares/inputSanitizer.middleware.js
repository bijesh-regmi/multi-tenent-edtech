// import { sanitizeObject, sanitizeString } from '../utils/inputSanitizer.js';

// /**
//  * Input Sanitizer Middleware
//  * Creates middleware that whitelist/sanitizes input fields per route
//  */

// /**
//  * Creates a field whitelist middleware
//  * Only allows specified fields in req.body, strips everything else
//  * @param {Array<string>} allowedFields - Array of allowed field names
//  * @returns {Function} - Express middleware
//  */
// export const whitelist = (allowedFields) => {
//     return (req, res, next) => {
//         if (!req.body || typeof req.body !== 'object') {
//             return next();
//         }

//         // Create a new object with only allowed fields
//         const sanitizedBody = {};
//         for (const field of allowedFields) {
//             if (req.body.hasOwnProperty(field)) {
//                 sanitizedBody[field] = req.body[field];
//             }
//         }

//         // Sanitize string values
//         req.body = sanitizeObject(sanitizedBody);

//         next();
//     };
// };

// /**
//  * Predefined whitelists for common operations
//  */
// export const whitelists = {
//     // User signup - only these fields allowed
//     signup: whitelist(['email', 'username', 'password']),

//     // User login
//     login: whitelist(['email', 'username', 'password']),

//     // Password reset request
//     passwordResetRequest: whitelist(['email']),

//     // Password reset confirm
//     passwordResetConfirm: whitelist(['token', 'password', 'confirmPassword']),

//     // Profile update (excludes sensitive fields like role, etc.)
//     profileUpdate: whitelist(['username', 'email']),

//     // Password change
//     passwordChange: whitelist(['currentPassword', 'newPassword', 'confirmPassword']),
// };

// /**
//  * Generic input sanitizer middleware
//  * Sanitizes all string values in req.body without whitelisting
//  * Use this in combination with whitelist or for less sensitive endpoints
//  */
// export const sanitizeBodyMiddleware = (req, res, next) => {
//     if (req.body && typeof req.body === 'object') {
//         req.body = sanitizeObject(req.body);
//     }
//     next();
// };

// /**
//  * Strips dangerous fields from request body
//  * Use this to explicitly remove fields that should never come from user input
//  * @param {Array<string>} dangerousFields - Fields to always strip
//  * @returns {Function} - Express middleware
//  */
// export const stripDangerousFields = (dangerousFields = []) => {
//     const defaultDangerousFields = [
//         'id',
//         'userRole',
//         'isAdmin',
//         'refreshToken',
//         'createdAt',
//         'updatedAt',
//         'deletedAt',
//         'instituteId',
//         'password_hash',
//         '__proto__',
//         'constructor',
//         'prototype',
//     ];

//     const fieldsToStrip = [...new Set([...defaultDangerousFields, ...dangerousFields])];

//     return (req, res, next) => {
//         if (req.body && typeof req.body === 'object') {
//             for (const field of fieldsToStrip) {
//                 delete req.body[field];
//             }
//         }
//         next();
//     };
// };

// export default {
//     whitelist,
//     whitelists,
//     sanitizeBodyMiddleware,
//     stripDangerousFields,
// };
