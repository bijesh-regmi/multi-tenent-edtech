import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import createInstituteTable from "../../services/createInstituteTable.js";
import insertIntoInstituteTable  from "../../services/insertIntoInstituteTable.js";

export const createInstitute = asyncHandler(async (req, res) => {
    const {
        instituteName,
        instituteEmail,
        institutePhoneNumber,
        instituteAddress,
        vatNumber,
        panNumber,
    } = req.body;
    if (
        !instituteName?.trim() ||
        !instituteEmail?.trim() ||
        !institutePhoneNumber?.trim() ||
        !instituteAddress?.trim() ||
        !(vatNumber?.trim() || panNumber?.trim())
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const tableName= await createInstituteTable();
    await insertIntoInstituteTable({
        tableName,
        instituteName,
        instituteEmail,
        institutePhoneNumber,
        instituteAddress,
        vatNumber,
        panNumber,
    });
    res.status(200).json(
        new ApiResponse(200, { tableName }, "Institution creation successful"),
    );
});
