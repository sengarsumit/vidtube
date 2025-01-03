import mongoose,{Schema}  from "mongoose";

const videoSchema=new Schema(
    {
        videoFile:{type:String,required:true},//cloudinary video url
        thumbnail:{type:String,required:true},//cloudinary image url
        title:{type:String,required:true},
        description:{type:String,required:true},
        views:{type:Number,default:0},
        duration:{type:Number,required:true},
        isPublished:{type:Boolean,default:true},
        owner:{type:Schema.Types.ObjectId,ref:"User"},
    },
    {
        timestamps:true,
    }
)

export const Video=mongoose.model("Video",videoSchema)