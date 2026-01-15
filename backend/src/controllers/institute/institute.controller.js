import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/user.model.js";
import sequelize from "../../config/database.js";
import {
    createInstituteTable,
    createTeacherTable,
} from "../../services/createInstituteTables.js";
import insertIntoInstituteTable from "../../services/insertIntoInstituteTable.js";
import { QueryTypes, Transaction } from "sequelize";

export const createInstitute = asyncHandler(async (req, res, next) => {
    const {
        instituteName,
        instituteEmail,
        institutePhoneNumber,
        instituteAddress,
        vatNumber,
        panNumber,
    } = req.body;
    if (
        [
            instituteName,
            instituteEmail,
            institutePhoneNumber,
            instituteAddress,
        ].some((field) => !field || String(field).trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    //create institute table
    const { tableName, instituteNumber } = await createInstituteTable();
    //insert data to the institute table
    await insertIntoInstituteTable({
        tableName,
        instituteName,
        instituteEmail,
        institutePhoneNumber,
        instituteAddress,
        vatNumber,
        panNumber,
    });
    console.log("Institute table created and data entered successful");

    req.instituteNumber = instituteNumber;
    if (!req.user)
        throw new ApiError(
            500,
            "Unable to perform this action, user not allowed",
        );
    console.log("hiiiii");
    //create a a user_institute table to track the institutes created by the user
    await sequelize.query(
        `
        CREATE TABLE IF NOT EXISTS user_institute(
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        userId VARCHAR(255) NOT NULL REFERENCES users(id),
        instituteNumber INT  UNIQUE
        )
        `,
    );
    await sequelize.query(
        `INSERT INTO user_institute(userId,instituteNumber) VALUES(?,?)`,
        {
            replacements: [req.user.id, instituteNumber],
        },
    );
    //update the user with current institute number and set the role to institute
    await User.update(
        {
            currentInstituteNumber: instituteNumber,
            role: "institute",
        },
        {
            where: {
                id: req.user.id,
            },
        },
    );

    console.log("hahahuhu");
    res.status(200).json("success");
});

export const createTeacher = asyncHandler(async (req, res) => {
    await createTeacherTable();
    res.status(200).json("success");
});
