const catchAsync = require('../utils/catchAsync');
const expressErr = require('../utils/expressErr');
const User = require('../models/user');

// // REQUIRING PROCESS.ENV FILE AND CONFIGURING IT
require('dotenv').config();


// REGISTER ROUTE (GET)
module.exports.registerPage = (req, res) => {
	res.render(`users/register`)
};


// REGISTER ROUTE (POST)
module.exports.register = catchAsync(async (req, res, next) => {
	try {
		const { email, username, password, secret } = req.body;

		if (secret !== process.env.DPS_SECRET) {
			req.flash('error', 'Invalid Credentials. Please try again later.')
			return res.redirect('/register')
		}

		const user = new User({ email, username });
		user.isAdmin = false;
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, err => {
			if (err)
				return next(err);
			req.flash('success', `Welcome to DPSIS Project Archive ${username}!`)
			res.redirect('/projects')
		})
	} catch (err) {
		if (err.message.includes('A user with the given')) {
			req.flash('error', err.message);
		} else if (err.message.includes('E11000 duplicate key error collection:')) {
			const keyValue = Object.keys(err.keyValue)[ 0 ];
			req.flash('error', `A user with the given ${keyValue} already exists. Please try a different ${keyValue}.`);
		} else {
			console.log(err, ' Error at controllers/users.js (line 66)');
			req.flash('error', 'There was an error registering. Please try again later.');
		}
		return res.redirect('register');
	}
})

// RESET PASSWORD ROUTE (GET)
module.exports.reset = (req, res) => {
	res.render('users/reset');
};

// LOGIN ROUTE (GET)
module.exports.loginPage = (req, res) => {
	res.render(`users/login`)
}

// LOGIN ROUTE (POST)
module.exports.login = (req, res) => {
	// console.log(req.body); // Contains the form data submitted in the login route
	// console.log(req.user); // Contains the user information
	const redirectUrl = req.cookies.currentUrl;
	req.flash('success', `Welcome back ${req.user.username}!`)
	res.redirect(redirectUrl)
}

// LOGOUT ROUTE (GET)
module.exports.logout = (req, res, next) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		req.flash('success', 'Successfully logged you out!');
		res.redirect('/projects');
	});
}

