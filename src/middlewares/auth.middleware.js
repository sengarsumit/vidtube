import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
import {asynchandler}from "../utils/asynchandler"
import {ApiError} from "../utils/ApiError.js"

export const verifyJWT=asynchandler(async(req,_,next)=>{
    
})



