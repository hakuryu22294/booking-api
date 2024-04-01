const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const catchAsync = require('../errors/catchAsync');
const globalError = require('../errors/globalError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id, role, name) => {
  return jwt.sign({ id, role, name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    data: {
      accessToken: token,
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const countUsers = await User.countDocuments();
  const query =
    countUsers === 0
      ? User.create({ ...req.body, role: 'admin' })
      : User.create({ ...req.body });
  const newUser = await query;
  createSendToken(newUser, 201, res);
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new globalError('Please provide email and password', 400));
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new globalError('Invalid email or password', 401));
  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new globalError('There is no user with email address', 404));
  const resetToken = user.createPaswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: message,
    });
  } catch (err) {
    user.resetPassword = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new globalError('There was an error sending email. Try again later.', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user)
    return next(new globalError('Token is invalid or has expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user.correctPassword(req.body.passwordCurrent, user.password))
    return next(new globalError('Your current password is wrong', 401));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
});
