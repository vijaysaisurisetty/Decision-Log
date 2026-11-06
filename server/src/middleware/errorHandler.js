import AppError from "../utils/AppError.js";

export const notFound = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let errors = err.errors;

  // Handle express.json syntax error (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON body";
    errors = undefined;
  }

  // Handle entity too large (payload limit exceeded)
  if (err.type === "entity.too.large" || err.status === 413) {
    statusCode = 413;
    message = "Payload too large";
    errors = undefined;
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors || {}).map((item) => ({
      field: item.path,
      message: item.message
    }));
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errors = undefined;
  }

  // Handle Mongo duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    message = "A decision with this title already exists";
    errors = undefined;
  }

  // For unhandled 500 errors, hide internal message details in production
  if (statusCode === 500 && !err.isOperational) {
    console.error("[Unhandled Server Error]:", err);
    message = "Something went wrong";
  }

  const response = {
    success: false,
    message
  };

  if (errors && Array.isArray(errors) && errors.length > 0) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500 && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default {
  notFound,
  errorHandler
};

