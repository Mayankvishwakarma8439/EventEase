import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "All fields are must" });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "User doesn't exist" });

  const passMatch = await bcrypt.compare(password, user.password);
  if (!passMatch)
    return res
      .status(400)
      .json({ success: false, message: "Incorrect password" });

  const token = jwt.sign({ id: user._id }, env.jwtSecret, {
    expiresIn: "7d",
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
};

const signupController = async (req, res) => {
  const { username, email, password, role, department } = req.body;

  if (!username || !email || !password)
    return res
      .status(400)
      .json({ success: false, message: "All fields are must" });

  const normalizedEmail = String(email).toLowerCase().trim();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists)
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: username.trim(),
    email: normalizedEmail,
    password: hash,
    role: ["student", "organizer"].includes(role) ? role : "student",
    department: department || "",
  });

  const token = jwt.sign({ id: user._id }, env.jwtSecret, {
    expiresIn: "7d",
  });

  res.status(200).json({
    success: true,
    message: "Signup successful",
    token,
    user: {
      id: user._id,
      name: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
};

export { signupController, loginController };
