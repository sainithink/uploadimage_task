const express = require('express');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const router = express.Router();
const {
  login,
  register,
  // resendOTP,
  saveMedia,
} = require('../controllers/customerController');
const { EnsureCorrectUser } = require('../middleware/index');



// Customer Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/uploadimage',EnsureCorrectUser, saveMedia)



module.exports = router;
