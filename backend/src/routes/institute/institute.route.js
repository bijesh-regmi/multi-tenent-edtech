import { Router } from "express";
import {
    createInstitute,
    createTeacher,
} from "../../controllers/institute/institute.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(authenticate, createInstitute, createTeacher);

export default router;
