function notFound(req, res, next) {
  res.status(404).json({
    error: "Route not found",
    message: `No endpoint matches ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ error: "Invalid request", message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate record",
      message: "This participant is already registered for the event."
    });
  }
  console.error(err);
  res.status(err.status || 500).json({
    error: err.status ? err.message : "Internal server error",
    message: err.status ? undefined : "Something went wrong. Check the server logs."
  });
}

module.exports = { notFound, errorHandler };
