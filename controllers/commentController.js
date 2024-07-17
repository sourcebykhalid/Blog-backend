import Comment from "../models/commentModel.js";

export const addComment = async (req, res) => {
  try {
    const { content, userId, blogId } = req.body;
    const comment = new Comment({ content, user: userId, blog: blogId });
    await comment.save();
    res.status(201).json({ success: true, comment });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to add comment", error });
  }
};

export const getCommentsByBlogId = async (req, res) => {
  try {
    const { blogId } = req.params;
    const comments = await Comment.find({ blog: blogId }).populate(
      "user",
      "username"
    );
    res.status(200).json({ success: true, comments });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to get comments", error });
  }
};
