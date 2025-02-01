const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

exports.validateToken = asyncHandler(async (req, res, next) => {
  let token;

  // Check if Authorization header exists
  const authHeader = req.headers.authorization || req.headers.Authorization;


  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Extract token from the Bearer token
    token = authHeader.split(" ")[1];

    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // If verification fails, return an error
        return res.status(401).json({ message: "User is not authorized" });
      }

      // Attach the decoded user information to the request object
      req.user = decoded.user;

      // Proceed to the next middleware or route handler
      next();
    });
  } else {
    // If no token is provided, return an error
    return res.status(401).json({ message: "Authorization token is missing" });
  }
});
