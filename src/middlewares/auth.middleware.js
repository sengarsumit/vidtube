import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
import {asynchandler}from "../utils/asynchandler"
import {ApiError} from "../utils/ApiError.js"

export const verifyJWT=asynchandler(async(req,_,next)=>{
    const token=req.cookies.accessToken || req.header("Authorization")?.replace("Bearer","")

    if(!token)
    {
        throw new ApiError(401,"unauthorized")
    }
    try {
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        await User.findById(decodedToken._id).select("-password -refreshToken")

        if(!user)
            {
                throw new ApiError(401,"unauthorized")
            } 
        req.user=user    
        next()

    } catch (error) {
        throw new ApiError(401,error?.message||"invalid access token")
    }
   

})



