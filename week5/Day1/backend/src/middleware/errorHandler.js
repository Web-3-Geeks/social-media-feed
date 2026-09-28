const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || null;

  // Duplicate key, e.g. email already exists
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    errors = null;
  }

  // Mongoose schema validation failed
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = {};
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
  }

  // Invalid MongoDB id, e.g. /api/users/abc
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
    errors = null;
  }

  // Broken JSON in request body
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  if (statusCode === 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") {
      message = "Something went wrong";
    }
  }

  const response = { success: false, message };
  if (errors) response.errors = errors;
  if (process.env.NODE_ENV === "development") response.stack = err.stack;

  res.status(statusCode).json(response);
};

export default errorHandler;
