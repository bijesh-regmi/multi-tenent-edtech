import {
    signup,
} from "../../controllers/global/auth.controller.js";
import { Router } from "express";

const router = Router();

router.route("/signup").post(signup);

// // Signup - Rate limited (5/hour), input whitelisted
// router.route("/signup")
//     .post(
//         signupLimiter,
//         stripDangerousFields(),
//         whitelists.signup,
//         signup
//     );

export default router;
