import { signup } from "../../controllers/global/auth.controller.js";
import  { Router } from "express";
const router = Router();



router.route("/signup").post(signup)

export default router
