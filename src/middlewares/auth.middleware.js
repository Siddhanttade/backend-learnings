import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT=asyncHandler(async(req,res,next)=>{ //many a times it occurs that we dont use response so put an underscore at its place
    try {
        const token=req.cookies?.accessToken||req.header
        ("Authorization")?.replace("Bearer ","");
        //checking for token in cookies or headers sent by user 
        
        if(!token){
            throw new ApiError(401,"unAuthorized request no token found ");
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"invalid access token ");
        }
    
        req.user=user; //attaching user to req object so that we can use it in our next controllers
        next(); //this helps to move to next controller
    } catch (error) {
        throw new ApiError(401,error?.message||"unAuthorized request invalid token ");
    }
})