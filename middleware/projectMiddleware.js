// CATCH ASYNC FUNCTION DECLARATION
const catchAsync = require('../utils/catchAsync');

// // REQUIRING PROCESS.ENV FILE AND CONFIGURING IT
// require('dotenv').config();

// JOI SCHEMA VALIDATION
const { joiProjectSchema } = require('../joiSchemas');

// MODELS
const Project = require('../models/project');

// MIDDLEWARE TO CHECK WHETHER THE USER IS LOGGED IN
module.exports.isLoggedIn = (req, res, next) => {
	// console.log(req.user, 'FROM ISLOGGED IN MIDDLEWARE');
	if (!req.isAuthenticated()) {
		// req.session.returnTo = req.originalUrl || '/projects';
		// req.session.returnTo = req.originalUrl.slice(0, 34) || '/projects';
		req.flash('error', 'You need to be logged in to do that!');
		return res.redirect(`/login`);
	}
	next();
}

// MIDDLEWARE TO CHECK IF PROJECT EXISTS
module.exports.isProject = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	if (id.match(/^[0-9a-fA-F]{24}$/)) { // https://stackoverflow.com/questions/13850819/can-i-determine-if-a-string-is-a-mongodb-objectid
		// it's an ObjectID    
		let project = await Project.findById(id);
		if (!project) {
			req.flash('error', 'Cannot find that project!');
			return res.redirect('/projects');
		} else {
			project = await Project.findById(id)
				.populate({ // Populate all comments from comments array (ref: Comment/model: Project)
					path: 'comments',
					populate: { path: 'author' } // Populate author for each comment (ref: User/model: Comment)
				})
				.populate('owner') // Populate owner of book (ref: User/model: Project)

			res.locals.foundProject = project;
			res.locals.id = id;
		}
	} else {
		// nope 
		req.flash('error', 'Invalid argument type for Project ID! Please try another ID.');
		return res.redirect('/projects');
	}
	next();
});

// MIDDLEWARE TO CHECK WHETHER ADMIN IS THE USER
module.exports.isAdmin = async (req, res, next) => {
	// const mongoAtlas = process.env.MONGODB_ATLAS_ID;
	// const localMongo = process.env.LOCALHOST_MONGO_ID;
	if (req.user.isAdmin == false) {
		req.flash('error', 'You require admin permission to do that!');
		return res.redirect('/projects');
	}
	next();
}

// MIDDLEWARE TO CHECK WHETHER USER IS OWNER OF POSTING
module.exports.isOwner = catchAsync(async (req, res, next) => {
	const mongoAtlas = process.env.MONGODB_ATLAS_ID;
	const localMongo = process.env.LOCALHOST_MONGO_ID;
	// const id = res.locals.id;
	// const foundBook = res.locals.foundBook;
	const { id } = req.params;
	const project = await Project.findById(id);

	if (project.owner.equals(req.user._id)) {
		next();
	} else {
		req.flash('error', 'You do not have permission to do that!');
		return res.redirect(`/projects/${id}`);
	}
})

// MIDDLEWARE TO VALIDATE BOOK 
module.exports.validateProject = (req, res, next) => {
	const { error } = joiProjectSchema.validate(req.body);
	let errMessage;
	let flashMessage = '';
	const returnUrl = req.originalUrl;

	// if (req.files.length > 5) {
	// 	req.flash('error', 'Number of images cannot exceed 5. Please try again.');
	// 	if (returnUrl === '/projects') {
	// 		return res.redirect('/projects/new');
	// 	} else {
	// 		return res.redirect(`${returnUrl}/edit`);
	// 	}
	// }
	if (error) {
		console.log(error, ' Error at /middleware/projectMiddleware.js (line 97)');
		errMessage = error.message;
		console.log(errMessage);
		// const msg = error.details.map(el => el.message).join(',');
		// throw new expressErr(msg, 400);
		// if (errMessage === `"project.price" must be a number`)
		// 	flashMessage = 'Project price must be a number!';
		if (errMessage.includes('must not include HTML!'))
			flashMessage = 'Your inputs may not contain HTML tags!';
		else
			flashMessage = errMessage;

		req.flash('error', flashMessage)
		if (returnUrl === '/projects') {
			return res.redirect('/projects/new');
		} else {
			return res.redirect(`${returnUrl}/edit`);
		}
	}
	next();
}

