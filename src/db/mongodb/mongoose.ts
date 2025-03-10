import mongoose from "mongoose";
import { mongoConfig } from "src/db/mongodb/config";

export const MongooseConnection = {
  connect: async () => {
    try {
      await mongoose.connect(mongoConfig.getURI(), {});
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  },
  disconnect: async () => {
    await mongoose.disconnect();
  },
};
