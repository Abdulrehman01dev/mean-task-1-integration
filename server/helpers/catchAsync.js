const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.log(err);
      return next(err);
    });
  };
};

module.exports = catchAsync;
