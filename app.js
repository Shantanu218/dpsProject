const express = require('express');
const mongoose = require('mongoose');

const Project = require('./models/project')
const Comment = require('./models/comment');
const User = require('./models/user');



const passport = require('passport')
const passportLocal = require('passport-local')

const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const session = require('express-session');
const catchAsync = require('./utils/catchAsync')
const expressErr = require('./utils/expressErr');
const { joiProjectSchema, joiCommentSchema } = require('./joiSchemas');
const flash = require('connect-flash')
const multer = require('multer')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const connectMongo = require('connect-mongo');


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) // Helps navigate to the views directory

app.use(express.urlencoded({ extended: true })) // This helps parse req.body
app.use(methodOverride('_method')) // To help use make put/patch requests

app.use(express.static(path.join(__dirname, '/public'))); // To serve static assets from the public directory
// console.log(path.join(__dirname, '/public'))

app.use(mongoSanitize());

require('dotenv').config();

// const mongoUrl = 'mongodb://127.0.0.1:27017/science';
const mongoUrl = process.env.CLOUD_ATLAS;

// Needs to be written before session config!!

const mongoStore = connectMongo.create({
	mongoUrl: mongoUrl,
	touchAfter: 24 * 60 * 60, // Update session once every 24 hours
	crypto: {
		secret: 'thisshouldbeabettersecret!'
	}
});

mongoStore.on('error', function (e) {
	// Error during creating a mongoStore
	console.log(e, ' ERROR AT MONGOSTORE')
	console.log('EROR ON LINE 65 ')
})

const sessionConfig = {
	mongoStore,
	name: 'sessionInfo',
	secret: 'secret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
		httpOnly: true,
		// secure: true, // Set to true when app is deployed and not hosted on localhost
	}
}

app.use(session(sessionConfig)) // Make sure session is used before passport.sessions
app.use(passport.initialize());
app.use(passport.session()); // Make sure to use session before you use passport.session
passport.use(new passportLocal(User.authenticate())); // Use passportLocal (which we have downloaded and required) and then run the authenticate method located on the User model
// This method was created by Passport-Local-Mongoose

passport.serializeUser((User.serializeUser())); // How to store a user in the session
passport.deserializeUser((User.deserializeUser())); // How to get a user out of the session

const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const commentRoutes = require('./routes/comments');



main().catch(err => console.log(err));


async function main() {
	await mongoose.connect(mongoUrl)
		.then(() => {
			console.log('Mongo connection successful!');
		})
		.catch((err) => {
			console.log('Oh no mongo connection error! app.js line 67')
			console.log(err);
		})
}


// FLASH MESSAGES CONFIGURATION
// NEEDS TO BE BEFORE THE ROUTES
const messageTypes = {
	'success': 'success',
	'warning': 'warning',
	'error': 'danger',
	'general': 'primary'
}

function localVariables(req, res, next) {
	// console.log(req.query)
	res.locals.messages = req.flash();
	res.locals.messageTypes = messageTypes;
	res.locals.currentUser = req.user;
	next();
}

// HELMET SETUP - FOR SECURITY
app.use(helmet({ contentSecurityPolicy: false }))
/*
const scriptSrcUrls = [
	"https://stackpath.bootstrapcdn.com/",
	"https://cdnjs.cloudflare.com/",
	"https://cdn.jsdelivr.net",
	"https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"
];
//This is the array that needs added to
const styleSrcUrls = [
	"https://fonts.googleapis.com/",
	"https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
	// "https://api.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: [ "'self'", ...connectSrcUrls ],
			scriptSrc: [ "'self'", "'unsafe-inline'", ...scriptSrcUrls ],
			styleSrc: [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
			workerSrc: [ "'self'", "blob:" ],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/YOURACCOUNT/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
				"https://images.unsplash.com/",
			],
			fontSrc: [ "'self'", ...fontSrcUrls ],
		},
	})
);
*/

app.use(flash(), localVariables);




app.get('/favicon.ico', (req, res) => res.status(204).end());

// Makes a cookie to save currentUrl 
app.all('*', (req, res, next) => {
	const badRoutes = '/login /register'
	if (badRoutes.includes(req.url))
		return next();

	const currentUrl = req.originalUrl.slice(0, 34);
	res.cookie('currentUrl', `${currentUrl}`)
	// console.log(currentUrl)
	next();
})

app.use('', userRoutes);
app.use('', projectRoutes);
app.use('', commentRoutes);

// PAGE NOT FOUND ROUTE 
app.all([ '*', '/projects/*' ], (req, res, next) => {
	// next(new ExpressError(404, 'Page Not Found', 'This page was not found. Please try another page.'));
	// req.flash('error', 'Invalid URL, please try again!')

	console.log(req.originalUrl, 'PAGE WAS NOT FOUND ERROR AT app.JS (LINE 154)');
	req.flash('error', 'Invalid URL, please try again!')
	const redirectTo = req.cookies.currentUrl || '/';
	return res.redirect(redirectTo);
})

const port = 3000;
app.listen(port, () => {
	console.log(`Serving app on localhost:${port}!`)
}) 