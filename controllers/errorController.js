const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value ${value} : please use another value!`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError('Invalid token. Please log in again!', 401);
};
const handleTokenExpiredError = (err) => {
  return new AppError('Your token has been expired. Please log in again!', 401);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Invalid input : ${errors}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDERED WEBSITE
  console.error('Error🛑', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  // console.log(req.originalUrl);
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // When any operational error ocur then send message to client // trusted errors

      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming or other unknown error: don't leak error details fro production
    }
    //  1. Log error to the console
    console.error('Error🛑', err);
    // 2. Send generic message
    return res.status('500').json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  // RENDERED WEBSITE

  if (err.isOperational) {
    // When any operational error ocur then send message to client // trusted errors

    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
    // Programming or other unknown error: don't leak error details fro production
  }
  //  1. Log error to the console
  console.error('Error🛑', err);
  // 2. Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    error.name = err.name;
    console.log(error.name);
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }

    sendErrorProd(error, req, res);
  }
};
