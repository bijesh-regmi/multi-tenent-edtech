import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

export const createCourse = asyncHandler(async (req, res, next) => {
    const { currentInstituteNumber: instituteNumber } = req;
    const {
        courseName,
        courseDescription,
        courseDuration,
        coursePrice,
        courseLevel,
    } = req.body;
    if (
        [
            courseName,
            courseDescription,
            courseDuration,
            coursePrice,
            courseLevel,j
        ].some((field) => !field || String(field).trim() === "")
    )
        throw new ApiError(400, "All fields are required");

    const courseThumbnail = req.file ? req.file.path : null;

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
                courseThumbnail,
            ],
        },
    );
    if (!courseData) throw new ApiError(500, "Failed to create course");
    res.status(201).json(new ApiResponse(201, courseData.toJSON,"Course created successfullly"))
});
