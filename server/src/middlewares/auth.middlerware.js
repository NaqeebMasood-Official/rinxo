// Why needed: This middleware handles authentication by verifying JWT tokens in incoming requests.
// In simple words, it protects routes by ensuring that only authenticated users can access them.

//When to use: Logged-in users trying to access protected routes in the application.

import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  // const token = req.body.token;
  const token = req.cookies.token;
  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith("Bearer")
  // ) {
  //   token = req.headers.authorization.split(" ")[1];
  // }

  console.log("token: ", token);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Token invalid or expired" });
  }
};
