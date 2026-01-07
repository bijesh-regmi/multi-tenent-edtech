import { DataTypes } from "sequelize";
import sequelize from "../config/databse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// * List of fields that are allowed for mass assignment during create/update
const MASS_ASSIGNABLE_FIELDS = ['username', 'password', 'email'];
// * List of fields that should never be set via user input
const PROTECTED_FIELDS = ['id', 'userRole', 'refreshToken', 'createdAt', 'updatedAt'];
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;


const containsNoNullBytes = (value) => {
    if (typeof value !== 'string') return true;
    if (value.includes('\0')) {
        throw new Error('Input cannot contain null bytes');
    }
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) {
        throw new Error('Input cannot contain control characters');
    }
    return true};

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
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [2, 16],
                    msg: 'Username must be between 2 and 16 characters',
                },
                // Only allow alphanumeric, underscore, and hyphen
                isValidFormat(value) {
                    if (!USERNAME_REGEX.test(value)) {
                        throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
                    }
                },
                // Check for null bytes and control characters
                noNullBytes(value) {
                    containsNoNullBytes(value);
                },
                // Ensure it doesn't start or end with hyphen/underscore
                validStartEnd(value) {
                    if (/^[-_]|[-_]$/.test(value)) {
                        throw new Error('Username cannot start or end with a hyphen or underscore');
                    }
                },
            },
        },
        password: {
            type: DataTypes.STRING(72),
            allowNull: false,
            validate: {
                len: {
                    args: [8, 72],
                    msg: 'Password must be between 8 and 72 characters',
                },
                // Basic password strength check
                isStrong(value) {
                    // At least one letter and one number
                    if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
                        throw new Error('Password must contain at least one letter and one number');
                    }
                },
            },
        },
        email: {
            type: DataTypes.STRING(254),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: 'Email cannot be empty',
                },
                isEmail: {
                    msg: 'Please provide a valid email address',
                },
                // Check for null bytes and control characters
                noNullBytes(value) {
                    containsNoNullBytes(value);
                },
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
            // Note: This field should NEVER be set from user input directly
        },


        refreshToken: {
            type: DataTypes.STRING(500),
            allowNull: true,
            // Note: this field should never be set from user input directly
        },
    },
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

// Static method to get mass assignable fields
User.getMassAssignableFields = () => MASS_ASSIGNABLE_FIELDS;

// Static method to get protected fields
User.getProtectedFields = () => PROTECTED_FIELDS;

// Static method for safe create (with field restriction)
User.safeCreate = async function (data) {
    // Only allow mass-assignable fields
    const safeData = {};
    for (const field of MASS_ASSIGNABLE_FIELDS) {
        if (data.hasOwnProperty(field)) {
            safeData[field] = data[field];
        }
    }
    return this.create(safeData, { fields: MASS_ASSIGNABLE_FIELDS });
};

User.safeUpdate = async function (instance, data) {
    // Only allow mass-assignable fields
    const safeData = {};
    for (const field of MASS_ASSIGNABLE_FIELDS) {
        if (data.hasOwnProperty(field)) {
            safeData[field] = data[field];
        }
    }
    return instance.update(safeData, { fields: MASS_ASSIGNABLE_FIELDS });
};

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
