import mongoose from "mongoose";
import blogModel from "../models/blogModel.js";
import userModel from "../models/userModel.js";

// GET ALL BLOGS
const getAllBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel.find({}).populate("user", "username");
    if (!blogs.length) {
      return res.status(200).send({
        success: false,
        message: "No blogs found",
      });
    }
    return res.status(200).send({
      success: true,
      blogCount: blogs.length,
      message: "All blogs listed",
      blogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while fetching the blogs",
      error: error.message,
    });
  }
};

// CREATE BLOG
const createBlogController = async (req, res) => {
  console.log("Received request body:", req.body); // Log entire request body

  const { title, description, category, user } = req.body; // user is already extracted from req.body
  const image = req.file.path;

  try {
    if (!user || user === "undefined") {
      return res.status(400).json({
        success: false,
        message: "User ID is missing or invalid.",
      });
    }

    // Find user by ID
    const existingUser = await userModel.findById(user);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newBlog = new blogModel({
      title,
      description,
      category,
      image, // Assuming multer middleware handles file uploads
      user, // Correctly assign user ID here
    });

    await newBlog.save();

    existingUser.blogs.push(newBlog._id);
    await existingUser.save();

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Error while creating blog:", error);
    return res.status(500).json({
      success: false,
      message: "Error while creating blog",
      error: error.message,
    });
  }
};

const updateBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    // Check if image was uploaded or if the existing image should be used
    const image = req.file ? req.file.path : undefined;

    const blog = await blogModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        image, // Only update image if provided
      },
      { new: true, runValidators: true } // runValidators to ensure validation rules are applied
    );

    if (!blog) {
      return res.status(404).send({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Error while updating blog:", error); // Log error for easier debugging
    return res.status(500).send({
      success: false,
      message: "Error while updating blog",
      error: error.message,
    });
  }
};

// SINGLE BLOG
const getBlogByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id).populate("user", "username");
    if (!blog) {
      return res.status(404).send({
        success: false,
        message: "Blog not found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Blog fetched successfully",
      blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error while fetching the blog",
      error: error.message,
    });
  }
};

// DELETE BLOG
const deleteBlogController = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id).populate("user");
    if (!blog) {
      return res.status(404).send({
        success: false,
        message: "Blog not found",
      });
    }

    await blogModel.findByIdAndDelete(req.params.id);
    blog.user.blogs.pull(blog._id); // Ensure we're pulling the correct blog ID
    await blog.user.save();

    return res.status(200).send({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error while deleting the blog",
      error: error.message,
    });
  }
};

// GET USER BLOG
const userBlogController = async (req, res) => {
  try {
    const userBlog = await userModel.findById(req.params.id).populate("blogs");
    if (!userBlog) {
      return res.status(404).send({
        success: false,
        message: "User not found with this ID",
      });
    }
    return res.status(200).send({
      success: true,
      message: "User blogs fetched successfully",
      userBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error in fetching user blogs",
      error: error.message,
    });
  }
};

export {
  getAllBlogsController,
  createBlogController,
  updateBlogController,
  getBlogByIdController,
  deleteBlogController,
  userBlogController,
};
