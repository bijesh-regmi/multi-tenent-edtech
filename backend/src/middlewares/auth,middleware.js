import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import User from "../models/user.model";

export const authenticate = asyncHandler(async (req, res, next) => {
    const accessToken =
        req?.cookies?.accessToken ||
        req?.headers?.authorization?.startsWith("Bearer")
            ? req.headers.authorization.split(" ")[1]
            : null;
    if (!accessToken) throw new ApiError(401, "Access Token is required");
    try {
        const decodedToken = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET_KEY,
        );
    } catch (error) {
        if (error === "TokenExpireError")
            throw new ApiError(401, "Expired access token");
        throw new ApiError(401, "Invalid access token");
    }

    const user = User.findByPk(decodedToken.id, {
        attributes: ["id", "username", "email", "userRole"],
    });
    if (!user) throw new ApiError(401, "User not found");
    req.user = user;
    req.userId = user.id;
    next();
});
