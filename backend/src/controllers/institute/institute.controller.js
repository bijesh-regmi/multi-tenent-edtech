import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/user.model.js";
import sequelize from "../../config/database.js";
import {
    createInstituteTable,
    createUserInstituteTable,
    createInstituteCategoryTable,
    createInstituteTeacherTable,
    createInstituteChapterTable,
    createInstituteStudentTable,
    createInstituteCourseTable,
} from "../../services/createInstituteTables.js";

/* ================= INSTITUTE ================= */
export const createInstitute = async (req, res, next) => {
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
    if (!instituteNumber) throw new ApiError(500, "Institute creation failed!");
    //create user_institute table
    await createUserInstituteTable(req.user.id, instituteNumber);
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
    next();
};

/* ================= CATEGORY ================= */
export const createInstituteCategory = async (req, res, next) => {
    const { instituteNumber } = req;
    await createInstituteCategoryTable(instituteNumber);
    next();
};


/* ================= TEACHER ================= */
export const createInstituteTeacher = async (req, res, next) => {
    const { instituteNumber } = req;
    await createInstituteTeacherTable(instituteNumber);
    next();
};


/* ================= COURSE ================= */
export const createInstituteCourse = async (req, res, next) => {
    const { instituteNumber } = req;
    await createInstituteCourseTable(instituteNumber);
    next();
};

/* ================= COURSE CHAPTER ================= */
export const createInstituteChapter = async (req, res, next) => {
    const { instituteNumber } = req;
    await createInstituteChapterTable(instituteNumber);
    next();
};

/* ================= CHAPTER LESSON ================= */
export const createInstituteLesson = async (req, res, next) => {
    const { instituteNumber } = req;
    await createInstituteTeacherTable(instituteNumber);
    next();
};

/* ================= STUDENT ================= */
export const createInstituteStudent = async (req, res, next) => {
    const { instituteNumber } = req;
    await createInstituteStudentTable(instituteNumber);
    next();
};