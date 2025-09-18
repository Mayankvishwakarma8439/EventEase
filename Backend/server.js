import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import connectDb from "./utility/db.js";
dotenv.config();

const app= express();
const PORT = process.env.PORT || 5000

app.use(cors());
app.use(express.json())
connectDb()
app.use("/api/auth",authRoutes)
app.use("/api/",eventRoutes)

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`)
})