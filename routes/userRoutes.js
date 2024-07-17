import express from "express";
import {
  getAllUsers,
  getUser,
  loginController,
  registerController,
  updateUser,
} from "../controllers/userController.js";

// router object
const router = express.Router();

// Get all users || GET
router.get("/all-users", getAllUsers);

//GET user profile
router.get("/current-user/:id", getUser);

//UPDATE user profile
router.put("/update-user/:id", updateUser);

// Create a user || POST
router.post("/register", registerController);

// Login user || POST
router.post("/login", loginController);

// Profile || GET
// router.get("/profile", getProfile);

export default router;
