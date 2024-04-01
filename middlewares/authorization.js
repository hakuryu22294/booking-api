const catchAsync = require('../errors/catchAsync');
const globalError = require('../errors/globalError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userSchema');

/**
 * Protect route middleware
 * @param {object} req
 * @param {object} res
 * @param {fn} next
 *
 */

exports.protect = catchAsync(async (req, res, next) => {
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    next(new globalError('You are not logged in. Please log in', 401));
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decode.id);
  if (!freshUser)
    next(
      new globalError(
        'The user belonging to this token does no longer exist',
        401
      )
    );
  console.log(req);
  if (freshUser.changePassword(decode.iat))
    return next(
      new globalError(
        'User recently changed password! Please log in again',
        401
      )
    );

  req.user = freshUser;
  next();
});

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new globalError('You do not have permission', 403));
    }
    next();
  };
};
