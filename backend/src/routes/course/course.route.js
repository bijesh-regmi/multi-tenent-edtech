import { Router } from "express";
const router = Router();
import { createCourse } from "../../controllers/institute/course/course.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/multer.middleware.js";
router.route("/create").post(authenticate,createCourse)

export default router;