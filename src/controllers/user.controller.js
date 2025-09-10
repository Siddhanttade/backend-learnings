import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js';  

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation-not empty
    //check if user already exists:username,email
    //check for img
    //check for avatar
    //upload them to cloudinary,check avatar
    //create user object-create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    const {fullName,email,username,password}=req.body;
    console.log("email:",email);
    // if (fullName==="") {
    //     throw new ApiError(400,"fullName required")
    // }

    //to check for all the above fields without explicitly writing if condition for each
    if (
        [fullName,email,username,password].some((fields)=>
            fields?.trim()==="")) 
    {
        throw new ApiError(400,"All fields req")
    }

    //here we will use User from models it has direct access to db
    //we are checking for existing email and username using findOne method and $ operator
    const existedUser=User.findOne({
        $or:[{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409,"username already exists")
    }
    //multer gives us this functionality it is a middleware which adds functionality
    //we are taking first property because we can get multer path
    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file needed");    
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400,"avatar file needed");    
    }    

    const user=await User.create({
        fullName,
        avatar:avatar.url, //we are only storing url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    );//we use this because mongoDb creates an id with db if the db is created 
    //.select helps us to remove the fields that we dont want

    if (!createdUser) {
        throw new ApiError(500,"something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully") //here we are formatting the response
    )

    // res.status(200).json({message: 'ok'});
    
});

export {registerUser};