require('dotenv').config();
const jwt = require('jsonwebtoken');
const apiResponse = require('../utils/apiResponse');
const db = require('../models/index');
// const AppError = require('../utils/appError')
  
exports.EnsureCorrectUser = (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        console.log();
        if (decoded && decoded._id) {
          const user = await db.Customer.findOne({_id:decoded._id}).select({name:1,email:1,phone:1,role:1});
          if(user){
            return next();
          }else{
            apiResponse.unauthorizedResponse(res,'Unauthorized');  
          }
        }
        else {
          apiResponse.unauthorizedResponse(res,'Unauthorized');
        }
      });
    } catch (error) {
      apiResponse.ErrorResponse(res,"Unauthorized -  Please provide correct Auth Token");
    }
  };  
