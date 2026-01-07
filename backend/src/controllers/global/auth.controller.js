import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user.model.js";
import {Op} from "sequelize"

export const signup = asyncHandler(async (req, res) => {
    if(req.body === undefined) console.log("body is undefined")
    if (!req.body) throw new ApiError(400, "No data provided.");
    
    const { email, username, password } = req?.body;
    if (
        [email, username, password]?.some(
            (field) => !field || String(field).trim() === "",
        )
    ) {
        throw new ApiError(400, "All fields are required.");
    }

    const existingUser = await User.findOne({
        where: {
    [Op.or]: [{ username }, { email }]
  },
    });
    if (existingUser) {
        throw new ApiError(400, "User alredy exists.");
    }

    const newUser = await User.create({
        username,
        password,
        email,
    });
    const user = await User.findByPk(newUser.id, {
        attributes: ["id", "username", "email", "createdAt"],
    });

    res.status(201).json(
        new ApiResponse(201, { user }, "User created successfully."),
    );
});
//todo: see the gpt version of this file for login controller and update this file accrodingly.
// export const signupInstitute = asyncHandler(async (req, res) => {
//     const { instituteName, email, username, password } = req.body ?? {};

//     if (![instituteName, email, username, password].every(Boolean)) {
//         throw new ApiError(400, "All fields are required.");
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     const normalizedUsername = username.toLowerCase().trim();

//     const existingUser = await User.findOne({
//         where: {
//             [Op.or]: [
//                 { email: normalizedEmail },
//                 { username: normalizedUsername },
//             ],
//         },
//     });

//     if (existingUser) {
//         throw new ApiError(409, "Email or username already exists.");
//     }

//     // TRANSACTION (important in SaaS)
//     const transaction = await sequelize.transaction();

//     try {
//         // 1️⃣ Create institute
//         const institute = await Institute.create(
//             { name: instituteName },
//             { transaction }
//         );

//         // 2️⃣ Create institute admin user
//         const user = await User.create(
//             {
//                 email: normalizedEmail,
//                 username: normalizedUsername,
//                 password,
//                 userRole: "institute",
//                 instituteId: institute.id,
//             },
//             { transaction }
//         );

//         await transaction.commit();

//         return res.status(201).json(
//             new ApiResponse(
//                 201,
//                 {
//                     user: {
//                         id: user.id,
//                         email: user.email,
//                         username: user.username,
//                         userRole: user.userRole,
//                         instituteId: user.instituteId,
//                     },
//                     institute: {
//                         id: institute.id,
//                         name: institute.name,
//                     },
//                 },
//                 "Institute registered successfully."
//             )
//         );
//     } catch (err) {
//         await transaction.rollback();
//         throw err;
//     }
// });
