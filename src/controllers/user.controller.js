import {asynchandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


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

export  {registerUser};