import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/user.model.js";
import sequelize from "../../config/database.js";
import {
    createInstituteTable,
    createUserInstituteTable,
    createInstituteTeacherTable,
    createInstituteStudentTable,
    createInstituteCourseTable,
} from "../../services/createInstituteTables.js";

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
    const { instituteNumber } = await createInstituteTable(
        instituteName,
        instituteEmail,
        institutePhoneNumber,
        instituteAddress,
        vatNumber,
        panNumber,
    );
    console.log("Institute table created and data entered successful");

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

    req.currentInstituteNumber = instituteNumber;
    res.send("success");
    // next();
});

export const createTeacher = asyncHandler(async (req, res, next) => {
    await createInstituteTeacherTable(req.currentInstituteNumber);
    next();
});
export const createStudent = asyncHandler(async (req, res, next) => {
    await createInstituteStudentTable(req.currentInstituteNumber);
    next();
});
export const createCourse = asyncHandler(async (req, res, next) => {

    await createInstituteCourseTable(req.currentInstituteNumber)
    next()
});

export const create