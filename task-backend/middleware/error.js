function ErrorHandler(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }
  
  export const errorMiddleware = (err, req, res, next) => {
    // Default to internal server error
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
  
    // Handle specific error types
    if (err.name === "CastError") {
      message = `Resource not found. Invalid ${err.path}`;
      statusCode = 400;
    }
  
    if (err.code === 11000) {
      message = `Duplicate ${Object.keys(err.keyValue)} entered`;
      statusCode = 400;
    }
  
    if (err.name === "JsonWebTokenError") {
      message = `JSON web token is invalid, try again`;
      statusCode = 400;
    }
  
    if (err.name === "TokenExpiredError") {
      message = `JSON web token has expired, try again`;
      statusCode = 400;
    }
  
    // Send the error response
    if (!res.headersSent) {
      res.status(statusCode).json({
        success: false,
        message: message
      });
    } else {
    }
  };
  
  export default ErrorHandler;