import { Router } from "express";
import {
    createInstitute,
    createInstituteCategory,
    createInstituteTeacher,
    createInstituteCourse,
    createInstituteChapter,
    createChapterLesson,
    createInstituteStudent,
    establishRelationship
} from "../../controllers/institute/institute.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router
    .route("/create")
    .post(
        authenticate,
        createInstitute,
        createInstituteCategory,
        createInstituteTeacher,
        createInstituteStudent,
        createInstituteCourse,
        createInstituteChapter,
        createChapterLesson,
        establishRelationship
    );

export default router;
