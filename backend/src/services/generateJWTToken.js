import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError.js";
const generateJWTTokens = async (userId) => {
    try {
        const user = await User.findOne({
            where:{
                publicId:userId
            }
        });
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        //save the refresh token in the user
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        user.refreshToken = hashedToken;
        await user.save();
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};
export default generateJWTTokens;
