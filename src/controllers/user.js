import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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

export { registerUser };
