const jwt = require('jsonwebtoken');
require('dotenv').config();
const http = require('http');
const db = require('../models/index');
const path = require('path');
const apiResponse = require("../utils/apiResponse");
const multer = require('multer');
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const bcrypt = require("bcrypt");


// register
exports.register = [
    // Validate fields.
    
	body("username").isLength({ min: 1 }).trim().withMessage("username  must be specified.")
		.isAlphanumeric().withMessage("username has non-alphanumeric characters."),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
    body("password").isLength({ min: 3}).trim().withMessage("Password must be 6 characters or greater."),

	// Sanitize fields.
	sanitizeBody("username").escape(),
	sanitizeBody("email").escape(),
    sanitizeBody("password").escape(),
    // Process request after validation and sanitization.
    
	(req, res) => {
		try {
		
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {	console.log("sss",req.body.password);
				//hash input password
				bcrypt.hash(req.body.password,10,function(err, hash) {
					console.log("req.body.password",hash);
					// Create User object with escaped and trimmed data
					var user = new db.Customer(
						{
							username: req.body.username,
                            email: req.body.email,
							password: hash
						}
					);
						// Save user.
						user.save(function (err) {
							if (err) { return apiResponse.ErrorResponse(res, err); }
							let userData = {
								_id: user._id,
								username: user.username,
                                email: user.email,
                            };
                           
							return apiResponse.successResponseWithData(res,"Registration Success.", userData);
						});
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];


exports.login = [
        sanitizeBody("username").escape(),
        sanitizeBody("password").escape(),
        (req, res) => {
            try {
                console.log("hello");
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                }else {
                    db.Customer.findOne({username : req.body.username}).then(user => {
                        if (user) {
                            //Compare given password with db's hash.
                            bcrypt.compare(req.body.password,user.password,function (err,same) {
                                if(same){
                                        // Check User's account active or not.
                                        if(user.blocked == false) {
                                            let userData = {
                                                _id: user._id,
                                                username: user.username,
                                                email: user.email,
                                                job:user.job
                                            };
                                            //Prepare JWT token for authentication
                                            const jwtPayload = userData;
                                            const jwtData = {
                                                expiresIn: process.env.JWT_TIMEOUT_DURATION,
                                            };
                                            const secret = process.env.JWT_SECRET;
                                            //Generated JWT token with Payload and secret.
                                            userData.token = jwt.sign(jwtPayload, secret, jwtData);
                                            return apiResponse.successResponseWithData(res,"Login Success.", userData);
                                        }else {
                                            return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
                                        }
                                }else{
                                    return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
                                }
                            });
                        }else{
                            return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
                        }
                    });
                }
            } catch (err) {
                return apiResponse.ErrorResponse(res, err);
            }
        }];




// upload profile Image
exports.saveMedia =[ 
    async(req,res,next)=>{
    try {
        let token = req.headers.authorization.split(' ')[1];
        token = jwt.decode(token);
		let user_id = token._id;
		let file_path;
        var storage =   multer.diskStorage({
            destination: './public/Images/'+user_id+'/',
            filename: function (req, file, callback) {
              callback(null, file.originalname);
            }
		  });
		  console.log("storage",);
        const upload = multer({storage: storage,
            fileFilter: function (req, file, cb) {
				const ext = path.extname(file.originalname);
				file_path = 'http://localhost/'+user_id+'/'+ file.originalname;
                if (ext == '.jpg' | ext == '.jpeg' | ext == '.png') {
                    cb(null, true)
                } else {
                    cb('Only jpeg,jpg,png format images are allowed', false)
                }
            },
            limits: {
                files: 1,
                fileSize: 3 * 1024 * 1024
            }
          }).single('image')
          upload(req,res,function(err,result) {
            if(err) {
              return apiResponse.ErrorResponse(res, err);
			}
			// let file_path = './public/kyc/'+user_id+ user_id+ '-' + file.fieldname+path.extname(file.originalname)
			console.log("filename",file_path);
            return apiResponse.successResponseWithData(res,"Success upload",file_path);
            });  
    } catch (error) {
        return apiResponse.ErrorResponse(res, "error");
    }
}]

