import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["PORT", "MONGO_URL", "DEV_MODE"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware for security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: [
    "https://blogbeacon.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:8080",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cross-Origin-Resource-Policy",
  ],
  exposedHeaders: ["Cross-Origin-Resource-Policy"],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Logging middleware
app.use(morgan("dev"));

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to the Blog Beacon API");
});

// Set storage engine
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res, path, stat) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
