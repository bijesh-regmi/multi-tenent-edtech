import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { QueryTypes } from "sequelize";

export const createCourse = asyncHandler(async (req, res, next) => {
    const { currentInstituteNumber: instituteNumber } = req;
    const {
        courseName,
        courseDescription,
        courseDuration,
        coursePrice,
        courseLevel,
        courseCategory,
    } = req.body;
    if (
        [
            courseName,
            courseDescription,
            courseDuration,
            coursePrice,
            courseLevel,
            courseCategory
            
        ].some((field) => !field || String(field).trim() === "")
    )
        throw new ApiError(400, "All fields are required");

    const courseData = await sequelize.query(
        `INSET INTO course_${instituteNumber}(courseName,
        courseDescription,
        courseDuration,
        coursePrice,
        courseLevel,courseThumbnail)VALUES(?,?,?,?,?,?)`,
        {
            replacements: [
                courseName,
                courseDescription,
                courseDuration,
                coursePrice,
                courseLevel,
            ],
        },
    );
    if (!courseData) throw new ApiError(500, "Failed to create course");
    res.status(201).json(
        new ApiResponse(201, courseData.toJSON, "Course created successfullly"),
    );
});

export const deleteCoure = asyncHandler(async (req, res, next) => {
    const { currentInstituteNumber: instituteNumber } = req.user;
    const { courseId } = req.params;
    if (!courseId || String(courseId).trim() === "")
        throw new ApiError(400, "Course ID is required");

    const existsCourse = await sequelize.query(
        `
        SELECT * FROM course_${instituteNumber} WHERE id =?`,
        {
            replacements: [courseId],
            type: QueryTypes.SELECT,
        },
    );
    if (existsCourse.length === 0) throw new ApiError(404, "Course not found");

    const deleteCoure = await sequelize.query(
        `DELETE FROM course_${instituteNumber} WHERE id = ?`,
        {
            replacements: [courseId],
            type: QueryTypes.DELETE,
        },
    );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { existsCourse },
                "Course deleted successfully",
            ),
        );
});

export const getAllCourse = asyncHandler(async (req, res, next) => {
    const { currentInstituteNumber: instituteNumber } = req.user;
    const allCourse = await sequelize.query(
        `SELECT c.id, c.name FROM course_${instituteNumber} AS c
        JOIN category_${instituteNumber} AS cat ON c.categoryId = cat.id `,
        {type: QueryTypes.SELECT},
    );
    return res.status(200).json(new ApiResponse(2--,{...allCourse[0]},"All courses fetched successfully"))
});


export const getSingleCourse = asyncHandler(async(req,res)=>{
    const {currentInstituteNumber :instituteNumber } =req.user
    const courseId = req.params.id
    if(!courseId) throw new ApiError(400, "Invalid request, no course id provided")
    
    const course = await sequelize.query(
        `SELECT * FROM course_${instituteNumber} WHERE id =?`,
        {replacements:[courseId]},
        {types:QueryTypes.SELECT}
    )

})

