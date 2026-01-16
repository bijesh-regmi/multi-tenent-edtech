import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/user.model.js";
import sequelize from "../../config/database.js";
import {
    createInstituteTable,
    createTeacherTable,
    createUserInstituteTable,
} from "../../services/createInstituteTables.js";
import {
    insertIntoInstituteTable,
    insertIntoUserInstituteTable,
} from "../../services/insertIntoInstituteTables.js";
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
    const { instituteNumber } = await createInstituteTable(instituteName,
        instituteEmail,
        institutePhoneNumber,
        instituteAddress,
        vatNumber,
        panNumber,);
    console.log("Institute table created and data entered successful");

    //put instituteNumber in the req object to be used in next controller
    req.instituteNumber = instituteNumber;
    if (!req.user)
        throw new ApiError(
            500,
            "Unable to perform this action, user not allowed",
        );

    //create a a user_institute table to track the institutes created by the user
    await createUserInstituteTable(req.user.id, instituteNumber);

    // update the user with current institute number and set the role to institute
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
    res.status(200).json("success");
});

export const createTeacher = asyncHandler(async (req, res) => {
    await createTeacherTable();
    res.status(200).json("success");
});
