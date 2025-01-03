import mongoose,{Schema}  from "mongoose";
 
const userSchema=new Schema(
    {
        username:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},
        email:{type:String,required:true,unique:true,lowercase:true,trim:true},
        fullname:{type:String,required:true,trim:true,index:true},
        password:{type:String,required:true},
        avatar:{type:String,required:true},//cloudinary image url
        coverImage:{type:String},//cloudinary image url
        watchHistory:[{type:Schema.Types.ObjectId,ref:"Video"}],
        password:{type:String,required:[true,"Password is required"],minlength:8},
        refreshToken:{type:String},
    },
    {
        timestamps:true,
    }
)
export const User=mongoose.model("User",userSchema)