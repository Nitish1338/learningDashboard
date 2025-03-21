import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.js";
import {uploadCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async(req, res) =>{
    const{fullname, email,username,password}=req.body
    //console.log("email:",email);


    if(
      [fullname,email,username,password].some((field)=> field?.trim() === "")
    ){
      throw new ApiError(400,"All fields are required")
    }

    const existeduser = await User.findOne({
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
   const avatar = await uploadCloudinary(avatarLocalPath)
   const coverImage = await uploadCloudinary(coverImageLocalPath)

   if(!avatar){
      throw new ApiError(400,"Avatar file is required")
   }

   const user = await user.create({
      fullname,
      avatar:  avatar.url,
      coverImage: coverImage?.url ||"",
      email,
      password,
      username: username.toLowerCase()
   })
   const createduser = await user.findById(user._id).select(
      "-password -refreshToken"
   )
   if(!createduser){
      throw new ApiError(500,"something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(200,createduser, "User registerd Successfully")
   )

})

export{registerUser}