const globalError = require('./globalError');

require('dotenv').config();

/**
 *
 * @param {globalError} err
 * @param {Response} res
 */

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new globalError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  console.log(message);
  return new globalError(message, 400);
};

const handleTokenExpiredError = (err) =>
  new globalError('Your token has expired! Please login again.', 401);

const handleJWTError = (err) =>
  new globalError('Invalid Token. Please login agian!', 400);

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  console.log(errors);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new globalError(message, 400);
};
const sendErrorProd = (err, res) => {
  err.isOperational
    ? res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    : res.status(500).json({
        status: 'Internal Server Error',
        message: 'Something went wrong',
      });
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError(error);
    sendErrorProd(error, res);
  }
};
