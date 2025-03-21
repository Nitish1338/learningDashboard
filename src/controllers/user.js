import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.js";
import {uploadCloudinary} from "../utils/cloudinary.js"


const registerUser = asyncHandler(async(req, res) =>{
    const{fullname, email,username,password}=req.body
    console.log("email:",email);

 /*   if (fullname==""){
      throw new ApiError(400,"fullname is required")
    }
*/
    if(
      [fullname,email,username,password].some((field)=> field?.trim() === "")
    ){
      throw new ApiError(400,"All fields are required")
    }

    const existeduser = user.findOne({
      $or:[{username},{email}]
    })
    if(existeduser){
      throw new ApiError(409,"user with email already exists")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is required")
    }
    await uploadCloudinary(avatarLocalPath)
   const coverImage = await uploadCloudinary(coverImageLocalPath)

   if(!avatar){
      throw new ApiError(400,"Avatar file is required")
   }

   user.create({
      fullname,
      avatar:  avatar.url,
      coverImage: coverImage?.url ||"",
      email,
      password,
      username: username.toLowerCase()
   })

})

export{registerUser}