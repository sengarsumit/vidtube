import {asynchandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken=async (userId)=> {
  
   try {
    const user= await  User.findById(userId)
    if(!user)
    {
        throw new ApiError(404,"User not found")
    }
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}

   } catch (error) {
    throw new ApiError(500,"Something went wrong while generating access and refresh token")
   }
}

const registerUser=asynchandler(async(req,res)=>{
const {fullname,email,username,password}=req.body
//validations
if([fullname,username,email,password].some((field)=>field?.trim()===""))
{
    throw new ApiError(400,"all fields are required");
}
const existedUser=await User.findOne({
    $or:[{username},{email}]
})
if(existedUser)
{
    throw new ApiError(409,"all fields are User with email or username already exist");
}

const avatarLocalOath=req.files?.avatar?.[0]?.path
const coverLocalPath=req.files?.coverImage?.[0]?.path
if(!avatarLocalOath)
{
    throw new ApiError(400,"avatar file is missing");
}
// const avatar=await uploadOnCloudinary(avatarLocalOath);
// let coverImage=""
// if(coverLocalPath){
//     coverImage=await uploadOnCloudinary(coverLocalPath)
// }                
let avatar;
try {
    avatar=await uploadOnCloudinary(avatarLocalOath)
    console.log("uploaded avatar",avatar)
} catch (error) {
    console.log("Error uploading error",error);
    throw new ApiError(500,"failed to upload avatar")
}
let coverImage;
try {
    coverImage=await uploadOnCloudinary(coverLocalPath)
    console.log("uploaded coverImage",coverImage)
} catch (error) {
    console.log("Error uploading error",error);
    throw new ApiError(500,"failed to upload cover image")
}
try {
    const user=await User.create(
        {
            fullname,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
             
             email,
             password,
             username:username.toLowerCase(),
        }
    )
    const createdUser=await User.findById(user._id).select("-password -refreshToken")
    
    
    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrong while registering a user")
    
    }
    return res
    .status(201).json(new ApiResponse(200,createdUser,"User registered sucessfully"))
} catch (error) {
    console.log("user creation failed")

    if(avatar)
    {
        await deleteFromCloudinary(avatar.public_id)

    }
    if(coverImage)
    {
        await deleteFromCloudinary(coverImage.public_id)
    }
    throw new ApiError(500,"Something went wrong while registering a user and deleted the images")
    
}

})
const loginUser=asynchandler(async(req,res)=>{
     const {email,username,password}=req.body
     if(!email)
     {
        throw new ApiError(400,"email is required")

     }
     const user=await User.findOne({
        $or:[{username},{email}]
     })
     if(!user)
     {
        throw new ApiError(404,"user not found")
     }

     const isPasswordValid=await user.isPasswordCorrect(password)
     if(!isPasswordValid)
     {
        throw new ApiError(401,"invalid credentials")
     }
     const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id) 
     const loggedInUser=await User.findById(user._id)
     .select("-password, -refreshToken");
     const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
     }
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshtoken",refreshToken,options)
     .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"user logged in successfully"))

})
const logoutUser=asynchandler(async(req,res)=>{
    // await User.findByIdAndUpdate(req.user._id)
})

const refreshAccessToken=asynchandler(async(req,res)=>
{
    const incomingRefreshToken=req.cookies.refreshToken|| req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Refresh token is required")
    }
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,

        )
        const user=await User.findById (decodedToken?._id)

        if(!user)
        {
             throw new ApiError(401,"Invalid refresh token")
       }
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"Invalid refresh token")
        }
        const options={
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",

        }
         await generateAccessAndRefreshToken(user._id)

         const {accessToken,refreshToken: newRefreshToken}=await generateAccessAndRefreshToken(user._id)
          
         return res.status(200)
         .cookie("accessToken",accessToken,options)
        .cookie("refreshtoken",newRefreshToken,options)
         .json(new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access token refreshed sucessfully"))


    } catch (error) {
        
    } 
})

export  {registerUser,loginUser,refreshAccessToken};