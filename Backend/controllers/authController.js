import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const loginController =async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password)return res.status(400).json({
        message:"All fields are must"
    })
    const user = await User.findOne({email})
    if(!user)return res.status(400).json({
        message:"User doesn't exists"
    })
    const passMatch = await bcrypt.compare(password,user.password);
    if(!passMatch)return res.status(400).json({
        message:"Incorrect Password"
    })
    const token = jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET)
    res.status(201).json({
        message:"Successfully logged in",
        token
    })
}
const signupController =async (req,res)=>{
    const {username,email,password} = req.body;
    if(!username || !email || !password)return res.status(400).json({
        message: "All fields are must"
    })
    const userExists = await User.findOne({email})
    if(userExists)return res.status(400).json({
        message:"User already exists"
    })
    const hashedPass = await bcrypt.hash(password,10)
    const user = await User.create({
        username,
        email,
        password: hashedPass
    })
    const token = jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET)
    res.status(200).json({
        message:"Successfully signed up",
        token
    })
}
export {signupController,loginController}