const express = require('express');
const toursRouter = require('./toursRouter');

const router = express.Router();

router.use('/tours', toursRouter);

module.exports = router;
