import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const authenticate = asyncHandler(async (req, res, next) => {
    const accessToken =
        req?.cookies?.accessToken ||
        (req?.headers?.authorization?.startsWith("Bearer")
            ? req.headers.authorization.split(" ")[1]
            : null);
    if (!accessToken) throw new ApiError(401, "Access Token is required");
    let decodedToken;
    try {
        decodedToken = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET_KEY,
        );
    } catch (error) {
        if (error.name === "TokenExpireError")
            throw new ApiError(401, "Expired access token");
        throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findByPk(decodedToken.sub, {
        attributes: [
            "id",
            "email",
            "username",
            "role",
            "currentInstituteNumber",
        ],
    });

    if (!user) throw new ApiError(401, "User not found");
    req.user = user;
    console.log("authentication successful");
    next();
});
