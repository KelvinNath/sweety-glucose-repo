function isValidHttpErrorStatus(statusCode) {
  return (
    typeof statusCode === "number" &&
    Number.isInteger(statusCode) &&
    statusCode >= 400 &&
    statusCode <= 599
  );
}

function errorMiddleware(err, req, res, next) {
  const statusCode = isValidHttpErrorStatus(err.statusCode)
    ? err.statusCode
    : 500;

  if (statusCode >= 400 && statusCode < 500) {
    return res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(statusCode).json({
    success: false,
    message: "Internal server error",
  });
}

module.exports = errorMiddleware;