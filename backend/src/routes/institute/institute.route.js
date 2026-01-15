import { Router } from "express";
import { createInstitute } from "../../controllers/institute/institute.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(authenticate,createInstitute);

export default router