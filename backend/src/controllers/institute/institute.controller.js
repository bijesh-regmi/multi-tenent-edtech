import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/user.model.js";
import {
    createInstituteTable,
    createUserInstituteTable,
    createCategoryTable,
    createTeacherTable,
    createChapterTable,
    createStudentTable,
    createCourseTable,
    createLessonTable,
} from "../../services/createInstituteTables.js";
import createRelationship from "../../services/alterInstituteTables.js";

/*1 ================= INSTITUTE ================= */
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

    req.instituteNumber = instituteNumber;
    next();
});
/*2 ================= CATEGORY ================= */
export const createInstituteCategory = asyncHandler(async (req, res, next) => {
    const { instituteNumber } = req;
    await createCategoryTable(instituteNumber);
    next();
});

/*3 ================= TEACHER ================= */
export const createInstituteTeacher = asyncHandler(async (req, res, next) => {
    const { instituteNumber } = req;
    await createTeacherTable(instituteNumber);
    next();
});

/*4 ================= COURSE ================= */
export const createInstituteCourse = asyncHandler(async (req, res, next) => {
    const { instituteNumber } = req;
    await createCourseTable(instituteNumber);
    next();
});

/*5 ================= COURSE CHAPTER ================= */
export const createInstituteChapter = asyncHandler(async (req, res, next) => {
    const { instituteNumber } = req;
    await createChapterTable(instituteNumber);
    next();
});

/*6 ================= CHAPTER LESSON ================= */
export const createChapterLesson = asyncHandler(async (req, res, next) => {
    const { instituteNumber } = req;
    await createLessonTable(instituteNumber);
    next();
});

/*7 ================= STUDENT ================= */
export const createInstituteStudent = asyncHandler(async (req, res, next) => {
    const { instituteNumber } = req;
    await createStudentTable(instituteNumber);
    next();
});
export const establishRelationship = asyncHandler(async (req, res, next) => {
    const { instituteNumber } = req;
    await createRelationship(instituteNumber);
     return res.status(201).json(new ApiResponse(201,{}, "Institute created successfully"));
});
