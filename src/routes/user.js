import { Router} from "express";
import {loginUser, logoutUser, registerUser} from "../controllers/user.js";
import { upload } from "../middlewares/multer.js";

import{verifyJWT} from "../middlewares/Auth.js";

const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name :"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
registerUser)

router.route("/login").post(loginUser)


router.route("/logout").post(verifyJWT,logoutUser)



export default router