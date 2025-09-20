import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js'; 
import jwt from 'jsonwebtoken'; 


const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;//we are setting the refresh token in the db
        await user.save({validateBeforeSave:false}); //we are saving the refresh token in the db no need to validate other fields

        return {accessToken,refreshToken};//here we have sent refreshToken to db and also returning it to the user
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and access tokens")
    }
}

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
    const existedUser=await User.findOne({
        $or:[{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409,"username already exists")
    }
    //multer gives us this functionality it is a middleware which adds functionality
    //we are taking first property because we can get multer path
    const avatarLocalPath=req.files?.avatar[0]?.path
    //const coverImageLocalPath=req.files?.coverImage[0]?.path;

    //now we will use classic if-else to check if coverImage exists or not because it is optional
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){ //we will check whether the cover img is an array or not
        coverImageLocalPath=req.files.coverImage[0].path
    }   
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

const loginUser=asyncHandler(async(req,res)=>{
    //req body data fetch
    //username or mail can login using either mail or username our single code would work on both
    //find user
    //password check if wrong nothing
    //if right give access token and refresh token
    //send secure cookies
    //send response

    const {email,username,password}=req.body;

    if(!(username || email)){
        throw new ApiError(400,"username or password  required");
    }

    //checking user on the  basis of email or username
    const user=await User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"user not found");
    }

    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"invalid password");
    }

    //now as we have stored user we also got some unwanted fields like password and refresh token

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

    //here we should decide whether the operation is costly or not
    const loggedInUser=await User.findById(user._id)
    .select("-password -refreshToken"); //we have all

    //cookies
    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {user:loggedInUser, //user trying to save access and refresh token on his own depending on his usecase
            accessToken,
            refreshToken},"user logged in successfully")
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    //get refresh token from cookie
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401,"unauthorized request"); //this is the response to API the ApiError is the response to frontend
        //we should not get fake response of 200
    }

    //it is not necessary that decodedToken must contain payload
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user=await User.findById(decodedToken?._id);
    
        if (!user) {
            throw new ApiError(401,"invalid refresh token");
        }
    
        if(user?.refreshToken!==incomingRefreshToken){
            throw new ApiError(401,"refresh token expired or used");
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken:newRefreshToken},
                "access token refreshed successfully")
        )
    } catch (error) {
        throw new ApiError(401,error?.message||"invalid refresh token");
    }
})



export {registerUser,loginUser,logoutUser,refreshAccessToken};