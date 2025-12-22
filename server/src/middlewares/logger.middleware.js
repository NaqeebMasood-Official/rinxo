// Why needed: Track requests and responses for debugging and monitoring purposes.

//When to use: Debugging, auditing requests, and monitoring application performance.

export const logger = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);

  next();
};
