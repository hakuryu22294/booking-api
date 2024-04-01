const express = require('express');
const toursRouter = require('./toursRouter');
const userRouter = require('./userRouter');

const router = express.Router();

router.use('/tours', toursRouter);
router.use('/users', userRouter);
module.exports = router;
