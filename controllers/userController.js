import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator"; // Add this for validation
import jwt from "jsonwebtoken";
const registerController = async (req, res) => {
  try {
    const errors = validationResult(req); // Use express-validator for validation
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { username, email, password } = req.body;
    const image = req.file ? req.file.filename : null;

    // existing user check
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds

    // save new user
    const user = new userModel({
      username,
      email,
      password: hashedPassword,
      image,
    });
    await user.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { id: user._id, username, email, image },
    });
  } catch (error) {
    console.error("Error in registerController:", error); // More specific logging
    return res.status(500).json({
      success: false,
      message: "Error in registration",
      error: error.message,
    });
  }
};

//GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    return res.status(200).send({
      userCount: users.length,
      success: true,
      message: "Fetched users successfully",
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in fetching users",
      error,
    });
  }
};

//GET User Profile
const getUser = async (req, res) => {
  const { id } = req.params; // Destructure directly from req.params, not req.params.id
  try {
    const userProfile = await userModel.findById(id);

    if (!userProfile) {
      return res.status(404).send({
        success: false,
        message: "User not found for id: " + id,
      });
    }

    return res.status(200).send({
      success: true,
      message: "Fetched user successfully",
      userProfile,
    });
  } catch (error) {
    console.error("Error in getUser:", error); // Log detailed error message
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message, // Send error message to client for debugging
    });
  }
};

//UPDATE User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, image, email } = req.body;
    const user = await userModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    return res.status(200).send({
      success: true,
      message: "User Updated!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error while updating user",
      error,
    });
  }
};

//login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not registered",
      });
    }

    // Compare provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id, // Using user ID for security reasons
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Set token expiration time
    );

    // Send response with user data and token
    return res.status(200).json({
      success: true,
      message: "Login successfully",
      token, // Include the token in the response
      user: {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// const getProfile = async (req, res) => {
//   try {
//     // Assuming user details are extracted from the request's JWT token
//     const user = req.user;

//     // Retrieve user profile from the database

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "User profile retrieved successfully",
//       user,
//     });
//   } catch (error) {
//     console.error("Error in getProfile:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// const updateProfile = async (req, res) => {
//   try {
//     const { username, email } = req.body;
//     const userId = req.user.userId;

//     // Update user profile in the database
//     const updatedUser = await userModel.findByIdAndUpdate(
//       userId,
//       { username, email },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "User profile updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Error in updateProfile:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
//     const userId = req.user.userId;

//     // Find user by ID
//     const user = await userModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Check if current password is correct
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Current password is incorrect",
//       });
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update user's password in the database
//     user.password = hashedPassword;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Password changed successfully",
//     });
//   } catch (error) {
//     console.error("Error in changePassword:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// const deleteAccount = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     // Delete user account from the database
//     await userModel.findByIdAndDelete(userId);

//     return res.status(200).json({
//       success: true,
//       message: "Account deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error in deleteAccount:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
export {
  registerController,
  getAllUsers,
  getUser,
  updateUser,
  loginController,
};
