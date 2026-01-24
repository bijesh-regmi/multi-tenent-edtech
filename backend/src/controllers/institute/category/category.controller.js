import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { QueryTypes } from "sequelize";
import sequelize from "../../../config/database.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { currentInstituteNumber: instituteNumber } = req.user;
    const { categoryName, description } = req.body;
    await sequelize.query(
        `INSERT INTO category_${instituteNumber}(categoryName,categoryDescription)VALUES(?,?)`,
        { replacements: [categoryName, description], type: QueryTypes.INSERT },
    );
    const [categoryData] = await sequelize.query(
        `SELECT * FROM category_${instituteNumber} WHERE categoryName=? ORDER BY createdAt DESC limit 1`,
        { replacements: [categoryName], type: QueryTypes.SELECT },
    );
    res.status(200).json(
        new ApiResponse({ categoryData }, "category created successfully"),
    );
});

export const getAllCategory = asyncHandler(async (req, res) => {
    const { currentInstituteNumber: instituteNumber } = req.user;
    const categories = await sequelize.query(
        `SELECT * FROM category_${instituteNumber}`,
        { type: QueryTypes.SELECT },
    );

    res.status(200).json(
        new ApiResponse(
            200,
            { ...categories },
            "categories fetched successfully",
        ),
    );
});

export const deleteCategorySafe = asyncHandler(async (req, res) => {
    const { currentInstituteNumber: instituteNumber } = req.user;
    const { categoryId } = req.params;

    // Check if courses exist
    const [courses] = await sequelize.query(
        `SELECT * FROM course_${instituteNumber} WHERE categoryId = ?`,
        { replacements: [categoryId], type: QueryTypes.SELECT },
    );
    if (courses.length > 0)
        throw new ApiError(
            400,
            "Cannot delete category; courses are assigned to this category",
        );

    //delete the course
    const [result] = await sequelize.query(
        `DELETE FROM category_${instituteNumber} WHERE id = ?`,
        { replacements: [categoryId], type: QueryTypes.DELETE },
    );
    const affectedRows = result?.affectedRows ?? 0;
    if (affectedRows === 0)
        throw new ApiError(404, "Category not found or already deleted");

    res.status(200).json(new ApiResponse(200, "Category deleted successfully"));
});

export const deleteCategoryCascade = asyncHandler(async (req, res) => {
    const { currentInstituteNumber: instituteNumber } = req.user;
    const { categoryId } = req.params;

    await sequelize.query(
        `DELETE from course_${instituteNumber} WHERE categoryId = ?`,
        { replacements: [categoryId], type: QueryTypes.DELETE },
    );

    const [result] = await sequelize.query(
        `DELETE FROM category_${instituteNumber} WHERE id = ?`,
        { replacements: [categoryId], type: QueryTypes.DELETE },
    );
    const affectedRows = result?.affectedRows ?? 0;
    if (affectedRows === 0)
        throw new ApiError(404, "Category not found or already deleted");

    res.status(200).json(new ApiResponse(200, "Category along with courses deleted successfully"));
});
