import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user.model.js";
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

    // Use safe create method with explicit field restriction
    // This prevents mass assignment attacks
    const newUser = await User.create({
        username: sanitizedUsername,
        password,
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

export const login = asyncHandler(async (res, res) => {
    if (!req.body) throw new ApiError(400, "Not data is provided!");
    const { identifier, password } = req.body;
    if (!identifier || !password)
        throw new ApiError(400, "All fields are required.");
    const user = await User.findOne({
        where: {
            identifier,
        },
    });
    if (!user) throw new ApiError(400, "Invalid credentials");

    const isValidPassword = await user.isValidPassword(password);

    if (!isValidPassword) throw new ApiError(400, "Invalid credentials");
    const { accessToken, refreshToken } = await generateJWTTokens(user.id);
    const loggedInUser = await User.findByPk(user.id, {
        attributes: {
            exclude: ["password", "refreshToken"],
        },
    });
    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true })
        .cookie("refreshToken", refreshToken,{httpOnly:true})
        .json(new ApiResponse(200,{loggedInUser}, "LogIn successful."))
});
