import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
// Signup function
export const signup = catchAsyncError(async (req, res) => {
    console.log('Received body:', req.body);

  const { name, email, role, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      role,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ message: 'User created successfully', token, user });
  } catch (err) {
    res.status(500).json({ message: 'Error signing up', error: err.message });
  }
});

// Login function 
// export const login = catchAsyncError(async (req, res) => {
//     const { email, password, role } = req.body;
  
//     try {
//       const user = await User.findOne({ where: { email, role } });
  
//       if (!user) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//       }
  
//       const isMatch = await bcrypt.compare(password, user.password);
  
//       if (!isMatch) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//       }
  
//       const token = jwt.sign(
//         { id: user.id, role: user.role },
//         process.env.JWT_SECRET_KEY,
//         { expiresIn: process.env.JWT_EXPIRES_IN }
//       );
  
//       res
//         .status(200)
//         .cookie('token', token, {
//           httpOnly: true, 
//           expires: new Date(Date.now() + 3600000), 
//           sameSite: 'strict' 
//         })
//         .json({ message: 'Login successful', user, token });
//     } catch (err) {
//       res.status(500).json({ message: 'Error logging in', error: err.message });
//     }
//   });
  
export const login = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;       // ⬅️ role removed

  try {
    /* ── 1. find user only by email ─────────────────────────────── */
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* ── 2. verify password ─────────────────────────────────────── */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* ── 3. sign JWT with the role we just fetched ──────────────── */
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN } // e.g. "1h"
    );

    /* ── 4. send response ───────────────────────────────────────── */
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 3600000), // 1 hour
        sameSite: "strict",
      })
      .json({
        message: "Login successful",
        token,
        userRole: user.role,   // convenience field for the FE
        user,                  // keep if you still need it
      });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

export const logout = catchAsyncError(async (req, res) => {
    try {
      res
        .status(200) 
        .cookie('token', '', {
          httpOnly: true, 
          expires: new Date(Date.now()), 
          sameSite: 'strict' 
        })
        .json({
          success: true,
          message: 'Logged out successfully.'
        });
    } catch (err) {
      res.status(500).json({ message: 'Error logging out', error: err.message });
    }
  });

  export const getUser = (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user, 
    });
  };
  

export default { signup, login, logout, getUser };
