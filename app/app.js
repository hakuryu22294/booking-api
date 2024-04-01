const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const router = require('../routes');
const dbConnect = require('../config/dbConnect');
const globalError = require('../errors/globalError');
const errorHandler = require('../errors/errorHandler');

dotenv.config();
const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(helmet());

app.use(express.json());
dbConnect();

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

app.use('/api/v1', router);
app.all('*', (req, res, next) => {
  next(new globalError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(errorHandler);

module.exports = app;
