import { Router } from "express";
import {
    createCourse,
    createInstitute,
    createStudent,
    createTeacher,
} from "../../controllers/institute/institute.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(authenticate, createInstitute, createCategory,createCourse,createTeacher,createStudent);

export default router;
