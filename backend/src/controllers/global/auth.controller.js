import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user.model.js";
import { Op } from "sequelize";
import {
    sanitizeUsername,
    sanitizeEmail,
    validUsername,
    validEmail,
} from "../../utils/inputSanitizer.js";

/**
 * User Signup Controller
 * Creates a new user with validated and sanitized input
 */
export const signup = asyncHandler(async (req, res) => {
    if (!req.body) throw new ApiError(400, "No data provided.");

    // Extract only allowed fields (whitelist approach)
    const { email, username, password } = req.body;

    // Validate required fields
    if (
        [email, username, password].some(
            (field) => !field || String(field).trim() === "",
        )
    ) {
        throw new ApiError(400, "All fields are required.");
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeUsername(username);
    const sanitizedEmail = sanitizeEmail(email);

    // Validate username format
    if (!validUsername(sanitizedUsername)) {
        throw new ApiError(
            400,
            "Username can only contain letters, numbers, underscores, and hyphens."
        );
    }

    // Validate username length after sanitization
    if (sanitizedUsername.length < 2 || sanitizedUsername.length > 16) {
        throw new ApiError(400, "Username must be between 2 and 16 characters.");
    }

    // Validate email format
    if (!validEmail(sanitizedEmail)) {
        throw new ApiError(400, "Please provide a valid email address.");
    }

    // Validate password length
    if (password.length < 8 || password.length > 72) {
        throw new ApiError(400, "Password must be between 8 and 72 characters.");
    }

    // Check if password meets minimum strength requirements
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        throw new ApiError(
            400,
            "Password must contain at least one letter and one number."
        );
    }

    // Check for existing user
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [
                { username: sanitizedUsername },
                { email: sanitizedEmail }
            ],
        },
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists.");
    }

    // Use safe create method with explicit field restriction
    // This prevents mass assignment attacks
    const newUser = await User.safeCreate({
        username: sanitizedUsername,
        password: password, // Will be hashed by model hook
        email: sanitizedEmail,
    });

    // Fetch user without sensitive fields
    const user = await User.findByPk(newUser.id, {
        attributes: ["id", "username", "email", "createdAt"],
    });

    res.status(201).json(
        new ApiResponse(201, { user }, "User created successfully."),
    );
});

// /**
//  * User Login Controller
//  * Authenticates user and returns tokens
//  */
// export const login = asyncHandler(async (req, res) => {
//     if (!req.body) throw new ApiError(400, "No data provided.");

//     const { email, username, password } = req.body;

//     // At least one identifier is required
//     if ((!email && !username) || !password) {
//         throw new ApiError(400, "Email or username and password are required.");
//     }

//     // Sanitize inputs
//     const sanitizedEmail = email ? sanitizeEmail(email) : null;
//     const sanitizedUsername = username ? sanitizeUsername(username) : null;

//     // Build where clause based on provided identifier
//     const whereClause = {};
//     if (sanitizedEmail) {
//         whereClause.email = sanitizedEmail;
//     } else if (sanitizedUsername) {
//         whereClause.username = sanitizedUsername;
//     }

//     // Find user
//     const user = await User.findOne({
//         where: whereClause,
//     });

//     // Use consistent error message to prevent user enumeration
//     if (!user) {
//         throw new ApiError(401, "Invalid credentials.");
//     }

//     // Verify password
//     const isPasswordValid = await user.isPasswordCorrect(password);

//     if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid credentials.");
//     }

//     // Generate tokens
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();

//     // Save refresh token to user (using direct field update, not mass assignment)
//     await user.update({ refreshToken }, { fields: ['refreshToken'] });

//     // Return response without sensitive data
//     res.status(200).json(
//         new ApiResponse(200, {
//             user: {
//                 id: user.id,
//                 username: user.username,
//                 email: user.email,
//                 userRole: user.userRole,
//             },
//             accessToken,
//             refreshToken,
//         }, "Login successful."),
//     );
// });

// /**
//  * User Logout Controller
//  * Invalidates refresh token
//  */
// export const logout = asyncHandler(async (req, res) => {
//     // Requires authentication middleware to set req.user
//     if (!req.user) {
//         throw new ApiError(401, "Authentication required.");
//     }

//     // Clear refresh token
//     await User.update(
//         { refreshToken: null },
//         { where: { id: req.user.id }, fields: ['refreshToken'] }
//     );

//     res.status(200).json(
//         new ApiResponse(200, null, "Logged out successfully."),
//     );
// });

// /**
//  * Refresh Token Controller
//  * Issues new access token using valid refresh token
//  */
// export const refreshToken = asyncHandler(async (req, res) => {
//     const { refreshToken: token } = req.body;

//     if (!token) {
//         throw new ApiError(400, "Refresh token is required.");
//     }

//     // Find user with this refresh token
//     const user = await User.findOne({
//         where: { refreshToken: token },
//     });

//     if (!user) {
//         throw new ApiError(401, "Invalid refresh token.");
//     }

//     // Verify token is valid (not expired, etc.)
//     try {
//         const jwt = await import('jsonwebtoken');
//         jwt.default.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
//     } catch (error) {
//         // Clear invalid refresh token
//         await user.update({ refreshToken: null }, { fields: ['refreshToken'] });
//         throw new ApiError(401, "Refresh token has expired or is invalid.");
//     }

//     // Generate new access token
//     const accessToken = user.generateAccessToken();

//     res.status(200).json(
//         new ApiResponse(200, { accessToken }, "Token refreshed successfully."),
//     );
// });
