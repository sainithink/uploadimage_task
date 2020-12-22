const mongoose = require("mongoose");
require('dotenv').config();
mongoose.set("debug", true);
mongoose.Promise = Promise;
mongoose
  .connect(`${process.env.DBLINK}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successfull!"));
module.exports.Customer = require("./customerModel");