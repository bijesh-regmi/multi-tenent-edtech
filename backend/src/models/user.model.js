import { Model, DataTypes, UUIDV4 } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
// const PROTECTED_FIELDS = ["password","userRole","createdAt","updatedAt"]
// const MASS_ASSIGNABLE_FIELDS= ["password","username","email"]
const containsNoNullBytesAndSpecialChars = (username) => {
    if (typeof username !== "string")
        throw Error(
            "Invalid input format: username contains illegal character",
        );
    if (username.includes("\0"))
        throw Error(
            "Invalid input format: username contains illegal character",
        );
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(username))
        throw Error(
            "Invalid input format: username contains illegal character",
        );
};

class User extends Model {
    //compare password
    async comparePassword(password) {
        return await bcrypt.compare(password, this.password);
    }

     generateAccessToken() {
        return  jwt.sign(
            {
                sub: this.id,
            },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            },
        );
    }
    generateRefreshToken() {
        return jwt.sign(
            {
                sub: this.id,
            },
            process.env.REFRESH_TOKEN_SECRET_KEY,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            },
        );
    }
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue:UUIDV4,
            primaryKey: true,
            unique:true
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: "Username cannot be empty",
                },
                len: {
                    args: [5, 16],
                    msg: "Username must be between 5 and 16 characters long. ",
                },
                isValidFormat(value) {
                    if (!USERNAME_REGEX.test(value))
                        throw Error(
                            "Username can only contains characters, numbers, underscore and hyphens.",
                        );
                },
                noNullByte(value) {
                    containsNoNullBytesAndSpecialChars(value);
                },
            },
        },

        password: {
            type: DataTypes.STRING(72),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "password cannot be empty",
                },
                len: {
                    args: [8, 64],
                    msg: "Password must be between 8 and 64 characters long.",
                },
                isStrong(value) {
                    if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value))
                        throw Error(
                            "Password must contains at least one character and one alphabet",
                        );
                },
            },
        },
        email: {
            type: DataTypes.STRING(254),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: "Email cannot be empty",
                },
                isEmail: {
                    msg: "Invalid email format",
                },
            },
        },
        role: {
            type: DataTypes.ENUM(
                "teacher",
                "student",
                "institute",
                "super-admin",
            ),
            defaultValue:"student",
        },
        currentInstituteNumber:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "users",
        modelName: "User",
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
                if (user.username) {
                    user.username = user.username.toLowerCase().trim();
                }
                if (user.email) {
                    user.email = user.email.toLowerCase().trim();
                }
            },

            beforeUpdate: async (user) => {
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
                if (user.changed("username")) {
                    user.username = user.username.toLowerCase().trim();
                }
                if (user.changed("email")) {
                    user.email = user.email.toLowerCase().trim();
                }
            },
        },
    },
);

export default User