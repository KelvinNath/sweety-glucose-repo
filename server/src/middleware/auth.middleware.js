const { verifyToken } = require("../utils/jwt");

const BEARER_AUTHORIZATION_PATTERN = /^Bearer\s+(\S+)$/i;

function forwardUnauthorized(message) {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
}

function extractBearerToken(authorizationHeader) {
  const trimmedHeader = authorizationHeader.trim();

  if (!trimmedHeader) {
    return null;
  }

  const match = trimmedHeader.match(BEARER_AUTHORIZATION_PATTERN);

  return match ? match[1] : null;
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(forwardUnauthorized("Authentication required"));
  }

  const token = extractBearerToken(authHeader);

  if (!token) {
    return next(forwardUnauthorized("Invalid authorization format"));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(forwardUnauthorized("Invalid or expired token"));
  }
}

module.exports = authenticate;