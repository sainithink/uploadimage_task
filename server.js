require('dotenv').config();
const express = require('express');

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const admin = require('firebase-admin');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const apiRoutes = require('./routes/api');
const db = require('./models/index');
const path = require('path');

const { PORT } = process.env;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
app.use(bodyParser.text({ type: 'text/html' }));
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride('_method'));
app.use(helmet());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});



app.use('/api', limiter);
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());
app.use(
  session({
    secret: 'abcd',
    resave: false,
    saveUninitialized: false,
  })
);



app.get('/favicon.ico', (res) => res.status(204));

 
app.get('/', function(req,res){
  console.log("hi");
  return res.status(200).json({message:"API routes of Rupe"});
});
app.use('/api', apiRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.listen(process.env.PORT || 3000, function () {
  console.log(`Server is starting at port ${process.env.PORT}`);
});
