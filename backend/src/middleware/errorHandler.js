const { logger } = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.status = 'fail';
    err.isOperational = true;
  }
  // Mongoose cast error
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.status = 'fail';
    err.isOperational = true;
  }
  // MongoDB duplicate key error
  if (err.code && err.code === 11000) {
    err.statusCode = 400;
    err.status = 'fail';
    err.name = 'MongoError';
    err.message = 'Duplicate key error';
    err.isOperational = true;
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error('Error 💥', {
      error: err,
      stack: err.stack,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.status,
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    });
  } else {
    // Production mode
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.status,
          name: err.name,
          message: err.message,
        },
      });
    } else {
      // Programming or unknown errors
      logger.error('Error 💥', {
        error: err,
        stack: err.stack,
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'error',
          name: err.name,
          message: 'Something went wrong',
        },
      });
    }
  }
};

module.exports = {
  AppError,
  errorHandler,
}; 