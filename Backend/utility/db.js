import mongoose from "mongoose";
import { env } from "../config/env.js";

const connectDb = async()=>{
    try {
        await mongoose.connect(env.mongodbUri)
        console.log("Db connected successfully")
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
export default connectDb
