const AppError = require("../helpers/apiError");

// Middleware to handle undefined routes
const routeNotHandler = (req, res, next) => {
  console.log({ originalUrl: req.originalUrl });
  next(new AppError(`Error :: Can't find route -> ${req.originalUrl} <-`, 404));
};

module.exports = routeNotHandler;
