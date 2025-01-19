import {Router} from "express"
import {upload} from "../middlewares/multer.middleware.js"
import {registerUser,logoutUser,loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDeatils,
    getUserChannelProfile, updateUserAvatar, updateUserCoverImage, getWatchHistory,} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router=Router()
router.route("/register").post(upload.fields([
    {name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)


//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/update-account").patch(verifyJWT,updateAccountDeatils)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/history").get(verifyJWT,getWatchHistory)
export default router
