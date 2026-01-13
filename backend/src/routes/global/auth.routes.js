import {
    signup,
    login
} from "../../controllers/global/auth.controller.js";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/signup").post(signup);
//protected routes
router.route("/login").get(login)





// // Signup - Rate limited (5/hour), input whitelisted
// router.route("/signup")
//     .post(
//         signupLimiter,
//         stripDangerousFields(),
//         whitelists.signup,
//         signup
//     );

export default router;
