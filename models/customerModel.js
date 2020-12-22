const mongoose = require('mongoose');
const validator = require('validator');
const AppError = require('../utils/appError');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String
  },
  password: String,
  email: {
    type: String,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  profile_image:{type:String},
  username: {
    type: String
  },

  blocked:{type:Boolean,default:false},

},{
  timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);
