// import jwt from 'jsonwebtoken';
// import ApiError from '../utils/ApiError.js';
// import User from '../models/user.model.js';

// /**
//  * JWT Authentication Middleware
//  * Validates access tokens and attaches user to request
//  */
// const authenticate = async (req, res, next) => {
//     try {
//         // Get token from Authorization header
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             throw new ApiError(401, 'Access token is required');
//         }

//         const token = authHeader.split(' ')[1];

//         if (!token) {
//             throw new ApiError(401, 'Access token is required');
//         }

//         // Verify token
//         let decoded;
//         try {
//             decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
//         } catch (error) {
//             if (error.name === 'TokenExpiredError') {
//                 throw new ApiError(401, 'Access token has expired');
//             }
//             throw new ApiError(401, 'Invalid access token');
//         }

//         // Find user
//         const user = await User.findByPk(decoded.id, {
//             attributes: ['id', 'username', 'email', 'userRole'],
//         });

//         if (!user) {
//             throw new ApiError(401, 'User not found or has been deleted');
//         }

//         // Attach user to request
//         req.user = user;
//         req.userId = user.id;

//         next();
//     } catch (error) {
//         next(error);
//     }
// };

// /**
//  * Role-Based Access Control (RBAC) Middleware
//  * Restricts access to specific user roles
//  * @param {...string} allowedRoles - Roles that are allowed to access the route
//  * @returns {Function} - Express middleware
//  */
// export const authorize = (...allowedRoles) => {
//     return (req, res, next) => {
//         // Must be used after authenticate middleware
//         if (!req.user) {
//             return next(new ApiError(401, 'Authentication required'));
//         }

//         if (!req.user.userRole) {
//             return next(new ApiError(403, 'User role not assigned'));
//         }

//         if (!allowedRoles.includes(req.user.userRole)) {
//             return next(new ApiError(403, 'Access denied. Insufficient permissions.'));
//         }

//         next();
//     };
// };

// /**
//  * Optional authentication middleware
//  * Attaches user to request if token is valid, but doesn't require it
//  */
// export const optionalAuth = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return next();
//         }

//         const token = authHeader.split(' ')[1];

//         if (!token) {
//             return next();
//         }

//         try {
//             const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
//             const user = await User.findByPk(decoded.id, {
//                 attributes: ['id', 'username', 'email', 'userRole'],
//             });

//             if (user) {
//                 req.user = user;
//                 req.userId = user.id;
//             }
//         } catch (error) {
//             // Token invalid, but that's okay for optional auth
//             // Just proceed without user attached
//         }

//         next();
//     } catch (error) {
//         next(error);
//     }
// };

// export default authenticate;