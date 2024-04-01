const { Router } = require('express');
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authorization');
const { updateMe } = require('../controllers/userController');

const userRouter = Router();

userRouter.post('/signup', signup);
userRouter.post('/signin', signin);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);
userRouter.patch('/updatePassword/', protect, updatePassword);
userRouter.patch('/updateMe/', protect, updateMe);

module.exports = userRouter;
