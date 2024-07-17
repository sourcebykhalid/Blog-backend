import express from "express";
import {
  addComment,
  getCommentsByBlogId,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/add-comment", addComment);
router.get("/:blogId", getCommentsByBlogId);

export default router;
