// Unit tests for: createBlogController

import mongoose from "mongoose";
import blogModel from "../../models/blogModel.js";
import userModel from "../../models/userModel.js";
import { createBlogController } from "../blogController";

jest.mock("../../models/blogModel.js");
jest.mock("../../models/userModel.js");
jest.mock("mongoose", () => ({
  ...jest.requireActual("mongoose"),
  startSession: jest.fn(),
}));

describe("createBlogController() createBlogController method", () => {
  let req, res, session;

  beforeEach(() => {
    req = {
      body: {
        title: "Test Blog",
        description: "This is a test blog description",
        category: "Test Category",
        user: "userId123",
      },
      file: {
        path: "path/to/image.jpg",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mongoose.startSession.mockResolvedValue(session);
  });

  describe("Happy Path", () => {
    it("should create a blog successfully when all fields are provided", async () => {
      // Arrange
      const mockUser = { _id: "userId123", blogs: [], save: jest.fn() };
      userModel.findById.mockResolvedValue(mockUser);
      blogModel.prototype.save = jest.fn().mockResolvedValue({});

      // Act
      await createBlogController(req, res);

      // Assert
      expect(userModel.findById).toHaveBeenCalledWith("userId123");
      expect(blogModel.prototype.save).toHaveBeenCalledWith({ session });
      expect(mockUser.blogs.push).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalledWith({ session });
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Blog created successfully",
        newBlog: expect.any(Object),
      });
    });
  });

  describe("Edge Cases", () => {
    it("should return 400 if any required field is missing", async () => {
      // Arrange
      req.body.title = "";

      // Act
      await createBlogController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Please provide all fields",
      });
    });

    it("should return 404 if the user is not found", async () => {
      // Arrange
      userModel.findById.mockResolvedValue(null);

      // Act
      await createBlogController(req, res);

      // Assert
      expect(userModel.findById).toHaveBeenCalledWith("userId123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Unable to find the user",
      });
    });

    it("should handle errors during blog creation", async () => {
      // Arrange
      const error = new Error("Database error");
      blogModel.prototype.save = jest.fn().mockRejectedValue(error);

      // Act
      await createBlogController(req, res);

      // Assert
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(201); // Ensure it doesn't succeed
    });
  });
});

// End of unit tests for: createBlogController
