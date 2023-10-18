// CATCH ASYNC FUNCTION DECLARATION
const catchAsync = require('../utils/catchAsync');

// REQUIRING PROCESS.ENV FILE AND CONFIGURING IT
require('dotenv').config();

// JOI SCHEMA VALIDATION
const { joiCommentSchema } = require('../joiSchemas');

// MODELS
const Comment = require('../models/comment');

// MIDDLEWARE TO CHECK IF COMMENT EXISTS
module.exports.isComment = catchAsync(async (req, res, next) => {
	const { commentId } = req.params;
	const returnUrl = req.baseUrl;
	if (commentId.match(/^[0-9a-fA-F]{24}$/)) { // https://stackoverflow.com/questions/13850819/can-i-determine-if-a-string-is-a-mongodb-objectid
		// it's an ObjectID    
		const foundComment = await Comment.findById(commentId)
		if (!foundComment) {
			req.flash('error', 'Cannot find that comment!');
			return res.redirect(returnUrl);
		} else {
			res.locals.foundComment = foundComment;
			res.locals.commentId = commentId;
		}
	} else {
		// nope 
		req.flash('error', 'Cannot find that Comment!');
		return res.redirect(returnUrl);
	}
	next();
});

// MIDDLEWARE TO CHECK WHETHER USER IS AUTHOR OF COMMENT
module.exports.isAuthor = catchAsync(async (req, res, next) => {
	const mongoAtlas = process.env.MONGODB_ATLAS_ID;
	const localMongo = process.env.LOCALHOST_MONGO_ID;
	// const id = res.locals.id;
	// const foundBook = res.locals.foundBook;
	const { id, commentId } = req.params;
	const comment = await Comment.findById(commentId);

	if (comment.author.equals(req.user._id)) {
		next();
	} else {
		req.flash('error', 'You do not have permission to do that!');
		return res.redirect(`/projects/${id}`);
	}
})

// MIDDLEWARE TO VALIDATE COMMENT
module.exports.validateComment = (req, res, next) => {
	const { error } = joiCommentSchema.validate(req.body);
	if (error) {
		const errMessage = error.message;
		const returnUrl = req.cookies.currentUrl;
		// console.log(returnUrl, 'COMMENT MIDDLEWARE')
		let flashMessage = '';

		if (errMessage === `"comment.body" is not allowed to be empty`)
			flashMessage = 'Comment cannot be empty!';
		else if (errMessage === `"comment.rating" is required`)
			flashMessage = 'Comment needs to have a rating!';
		else
			flashMessage = errMessage;
		req.flash('error', flashMessage);
		return res.redirect(returnUrl);
		// error.message = error.details.map(el => el.message).join(',');
		// return next(error);
	}
	next();
}



