import { Router } from "express";
import { createInstitute } from "../../controllers/institute/institute.controller.js";
const router = Router();

router.route("/create").post(createInstitute);

export default router