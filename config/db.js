import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("Connected to MongoDB Database successfully".bgMagenta.white);
  } catch (error) {
    console.log("MongoDB connection error".bgRed.white);
  }
};

export default connectDB;
