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
import generateJWTTokens from "../../services/generateJWTToken.js";

export const signup = asyncHandler(async (req, res) => {
    if (!req.body) throw new ApiError(400, "No data provided.");
    const { email, username, password, confirmPassword } = req.body;
    
    if (
        [email, username, password, confirmPassword].some(
            (field) => !field || String(field).trim() === "",
        )
    ) {
        throw new ApiError(400, "All fields are required.");
    }
    if (password !== confirmPassword)
        throw new ApiError(400, "Confirm password did not match");
    // Sanitize inputs
    const sanitizedUsername = sanitizeUsername(username);
    const sanitizedEmail = sanitizeEmail(email);

    //TODO: safe create
    const newUser = await User.create({
        username: sanitizedUsername,
        password:password,
        email: sanitizedEmail,
    });

    const user = await User.findByPk(newUser.id, {
        attributes: ["id", "username", "email", "createdAt"],
    });

    return res.status(201).json(
        new ApiResponse(201, { user }, "User created successfully."),
    );
});

export const login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password)
        throw new ApiError(400, "All fields are required.");

    const user = await User.findOne({
        where: {
            [Op.or]: [{ email: identifier }, { username: identifier }],
        },
    });
    if (!user || !(await user.comparePassword(password)))
        throw new ApiError(401, "Invalid credentials");
    const { accessToken, refreshToken } = await generateJWTTokens(user.id);
    

    const { password: _, refreshToken: __,userRole:___,  ...safeUser } = user.toJSON();
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 30 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(new ApiResponse(200, { ...safeUser }, "LogIn successful."));
});


export const refreshToken = asyncHandler(async (req, res) => {});
export const forgetPassowrd = asyncHandler(async (req, res) => {});
export const resetPassword = asyncHandler(async (req, res) => {});
