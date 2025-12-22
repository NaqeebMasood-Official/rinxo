// Why needed: Central error handling middleware to catch and respond to errors consistently across the application.

// When to use: Always at the end of the middleware stack to handle any errors that occur in previous middlewares or route handlers.

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};
