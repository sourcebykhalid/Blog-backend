import mongoose from "mongoose";
import blogModel from "../models/blogModel.js";
import userModel from "../models/userModel.js";

// GET ALL BLOGS
const getAllBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel.find({}).populate("user", "username");
    if (!blogs.length) {
      // Adjusted check to verify the length of blogs array
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
      error,
    });
  }
};

//CREATE BLOG
const createBlogController = async (req, res) => {
  try {
    const { title, description, category, user } = req.body;
    const image = req.file?.path; // Cloudinary image path

    // Validation
    if (!title || !description || !category || !image || !user) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const existingUser = await userModel.findById(user);
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "Unable to find the user",
      });
    }

    const newBlog = new blogModel({
      title,
      description,
      category,
      image,
      user,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    await newBlog.save({ session });
    existingUser.blogs.push(newBlog);
    await existingUser.save({ session });
    await session.commitTransaction();

    return res.status(201).send({
      success: true,
      message: "Blog created successfully",
      newBlog,
    });
  } catch (error) {
    console.error(error); // Log the error
    return res.status(500).send({
      success: false,
      message: "Error while creating the blog",
      error: error.message || error, // Send a specific error message
    });
  }
};

// UPDATE BLOG
const updateBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    const image = req.file?.path; // Updated Cloudinary image path, if provided

    const blog = await blogModel.findByIdAndUpdate(
      id,
      { title, description, category, image: image || req.body.image },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while updating blog",
      error,
    });
  }
};

//SINGLE BLOG
const getBlogByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id).populate("user", "username");
    if (!blog) {
      return res.status(404).send({
        success: false,
        message: "blog not found",
        error,
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
      error,
    });
  }
};

//DELETE BLOG
const deleteBlogController = async (req, res) => {
  try {
    const blog = await blogModel
      .findOneAndDelete({ _id: req.params.id })
      .populate("user");
    await blog.user.blogs.pull(blog);
    await blog.user.save();
    return res.status(200).send({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error while deleting the blog ",
      error,
    });
  }
};

//GET user blog
const userBlogController = async (req, res) => {
  try {
    const userBlog = await userModel.findById(req.params.id).populate("blogs");
    if (!userBlog) {
      return res.status(404).send({
        success: false,
        message: "Blog not found with this id",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Blog fetched successfully",
      userBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error in user blog",
      error,
    });
  }
};

// const addCommentController = async (req, res) => {
//   try {
//     const { blogId, content, userId } = req.body;
//     const comment = new Comment({ content, blog: blogId, user: userId });
//     await comment.save();

//     const updatedBlog = await Blog.findByIdAndUpdate(
//       blogId,
//       { $push: { commentss: comment._id } },
//       { new: true }
//     ).populate("comments");

//     res.status(201).json({ success: true, comment });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to add comment" });
//   }
// };

export {
  getAllBlogsController,
  createBlogController,
  updateBlogController,
  getBlogByIdController,
  deleteBlogController,
  userBlogController,
};
