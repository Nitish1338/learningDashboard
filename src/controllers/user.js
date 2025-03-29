import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessandRefreshTokens= async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return{accessToken,refreshToken}


    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh token")
    }
}







const registerUser = asyncHandler(async (req, res) => {
    
    const { fullname, email, username, password } = req.body;
    //console.log("email",email);

    // Validate required fields
    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    // Extract the file paths for avatar and cover image
    const avatarLocalPath =req.files.avatar[0].path;
    //const coverImageLocalPath = req.files.coverImage[0].path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }




    // If avatar file is not provided, throw an error
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload files to Cloudinary
    const avatar = await uploadCloudinary(avatarLocalPath);
    const coverImage = await uploadCloudinary(coverImageLocalPath);

    // If avatar upload fails, throw an error
    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // Create a new user
    const user = await User.create({
        fullname,
        avatar: avatar.url,  // Save the uploaded avatar URL
        coverImage: coverImage?.url || "",  // If no cover image, set it as an empty string
        email,
        password,
        username: username.toLowerCase()
    });

    // Fetch created user without password or refreshToken
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Return the created user data
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});


const loginUser = asyncHandler(async(req, res)=> {
    const {email,password,username} = req.body
    console.log(email);

    if(!(email || username)){
        throw new ApiError(400,"username & email is requied")
    }


    const user =await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist")
    }


    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }



    const {accessToken,refreshToken} = await 
    generateAccessandRefreshTokens(user._id)


   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


   const options = {
     httpOnly: true,
     secure : true
   }

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(
        200,
        {
            user : loggedInUser,accessToken,refreshToken
        },

        "User logged In Successfully"
    )
   )
})

const logoutUser =  asyncHandler (async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken:undefined
            }
            
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly: true,
        secure : true
      }
      return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(new ApiResponse(200,{},"User logged Out"))
})

export { registerUser, loginUser,logoutUser };
