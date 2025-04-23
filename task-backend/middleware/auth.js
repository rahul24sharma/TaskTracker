import { catchAsyncError } from "./catchAsyncError.js"
import ErrorHandler from "./error.js"
import jwt from "jsonwebtoken"
import  User from "../models/userModel.js"

export const isAuthorised = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    console.log(req.cookies)
    if (!token) {
      return next(new ErrorHandler("User Not Authorized", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
    req.user = await User.findByPk(decoded.id);
  
    next();
  });