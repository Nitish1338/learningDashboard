import { Router} from "express";
import {resgisterUser} from "../controllers/user.js";


const Router = Router()


router.route("/register").post(resgisterUser)




export default router