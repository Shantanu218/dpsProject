const catchAsync = require('../utils/catchAsync');
const expressErr = require('../utils/expressErr');
const User = require('../models/user');


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
			return res.redirect('/login')
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
		console.log(err);
		req.flash('error', err.message);
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

