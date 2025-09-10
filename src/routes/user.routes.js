import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();

//this is an industry standard syntax to use middleware now we can send images
router.route("/register").post(
    upload.fields(
        [
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }]
    ),
    registerUser
);
// router.route("/login").post(login);

export default router;