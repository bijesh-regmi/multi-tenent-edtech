import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import generateJWTTokens from "../../services/generateJWTToken.js";
import User from "../../models/user.model.js";

export const signup = asyncHandler(async (req, res) => {
    if (!req.body) throw new ApiError(400, "No data sent.");
    const { email, username, password } = req.body;
    if (
        [username, password, email]?.some(
            (field) => !field || String(field).trim() === "",
        )
    ) {
        throw new ApiError(400, "All fields are required.");
    }

    const existingUser = await User.findOne({
        where: { username: username.toLowerCase(), email: email.toLowerCase() },
    });
    if (existingUser) throw new ApiError(400, "User alredy exists.");

    const newUser = await User.create({
        username,
        password,
        email,
    });
});
