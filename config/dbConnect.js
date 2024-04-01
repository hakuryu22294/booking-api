const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  await mongoose
    .connect(
      process.env.MONGO_URI.replace('<password>', process.env.MONGO_PASSWORDS)
    )
    .then((conn) => console.log(`connected to mongoDB ${conn.connection.host}`))
    .catch((err) => console.log(err));
};

module.exports = connectDB;
