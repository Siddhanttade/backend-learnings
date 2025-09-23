import { Router } from "express";
import {
     changeCurrentPassword,
     getUserChannelProfile, 
     registerUser,
     updateAccountDetails,
     updateUserAvatar, 
     updateUserCoverImage,
     getCurrentUser,
     getWatchHistory,
     logoutUser,
     loginUser,
     refreshAccessToken

    } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { loginUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";
import { upload } from "../middlewares/multer.middleware.js";
import { getWatchHistory } from "../controllers/user.controller.js";
import { get } from "mongoose"; 

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

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-Token").post(refreshAccessToken); //we will implement it later
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
//we are taking from params 
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("history").get(verifyJWT, getWatchHistory);



export default router;