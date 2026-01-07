import { signup, login, logout, refreshToken } from "../../controllers/global/auth.controller.js";
import { Router } from "express";
import { whitelists, stripDangerousFields } from "../../middlewares/inputSanitizer.middleware.js";
import authenticate from "../../middlewares/auth.middleware.js";

const router = Router();



// // Signup - Rate limited (5/hour), input whitelisted
// router.route("/signup")
//     .post(
//         signupLimiter,                    
//         stripDangerousFields(),      
//         whitelists.signup,                
//         signup
//     );

// router.route("/login")
//     .post(
//         loginLimiter,                     
//         stripDangerousFields(),           
//         whitelists.login,                 
//         login
//     );

// router.route("/logout")
//     .post(
//         authLimiter,      
//         authenticate,  
//         logout
//     );

// router.route("/refresh-token")
//     .post(
//         authLimiter,      
//         refreshToken
//     );

export default router;
