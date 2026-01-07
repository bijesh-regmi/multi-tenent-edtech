import { DataTypes, ENUM } from "sequelize";
import sequelize from "../config/databse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        username: {
            type: DataTypes.STRING(30),
            allowNull: false, //database level constrain, accepts username = ""
            unique: true,
            validate: {
                //application level constrain, can check for username=""
                len: [2, 16],
            },
        },
        password: {
            type: DataTypes.STRING(72),
            allowNull: false,
            validate: {
                len: [8, 72],
            },
        },
        email: {
            type: DataTypes.STRING(254),
            allowNull: false,
            validate: {
                notEmpty: true,
                isEmail: true,
            },
        },
        userRole: {
            type: DataTypes.ENUM(
                "teacher",
                "student",
                "institute",
                "super-admin",
            ),
            allowNull: true,
        },
        // instituteId: {
        //     type: DataTypes.UUID,
        //     allowNull: false,
        //     references: {
        //         model: "institutes",
        //         key: "id",
        //     },
        // },

        refreshToken: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
    },
    // {
    //     indexes: [
    //         { unique: true, fields: ["username", "instituteId"] },
    //         { unique: true, fields: ["email", "instituteId"] },
    //     ],
    // },
    {
        tableName: "users",
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
                    user.username = user.username.toLowerCase();
                }
                if (user.changed("email")) {
                    user.email = user.email.toLowerCase();
                }
            },
        },
    },
);

//this is instance method, so each  user table is reperesented by this
User.prototype.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

User.prototype.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this.id,
            role: this.userRole,
            instituteId: this.instituteId,
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};

User.prototype.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this.id,
            role: this.userRole,
            instituteId: this.instituteId,
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};

export default User;
