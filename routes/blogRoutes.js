import express from "express";
import {
  createBlogController,
  deleteBlogController,
  getAllBlogsController,
  getBlogByIdController,
  updateBlogController,
  userBlogController,
} from "../controllers/blogController.js";
import { upload } from "../config/cloudinaryConfig.js"; // Import the Cloudinary config

const router = express.Router();

// GET || all blogs
router.get("/all-blogs", getAllBlogsController);

// POST || create blog with file upload
router.post("/create-blog", upload.single("image"), createBlogController);

// PUT || update blog
router.put("/update-blog/:id", upload.single("image"), updateBlogController);

// GET || single blog details
router.get("/get-blog/:id", getBlogByIdController);

// DELETE || delete blog
router.delete("/delete-blog/:id", deleteBlogController);

// GET || user blog
router.get("/user-blog/:id", userBlogController);

export default router;
