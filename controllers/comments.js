const catchAsync = require('../utils/catchAsync');
const expressErr = require('../utils/expressErr');
const Project = require('../models/project');
const Comment = require('../models/comment');
const { validateComment } = require('../middleware/commentMiddleware');



// NEW ROUTE (POST)
// Middleware that has already run ==> isLoggedIn, isAdmin, validateComment
module.exports.new = catchAsync(async (req, res, next) => {
	const project = await Project.findById(req.params.id);
	const comment = new Comment(req.body.comment);
	comment.project = project._id;
	comment.timeCreated = new Date().toString().substring(0, 24) + ' SGT';

	comment.username = req.user.username
	comment.author = req.user._id;
	project.comments.push(comment);
	await comment.save();
	await project.save();
	req.flash('success', 'Successfully created a new comment!')
	res.redirect(`/projects/${project._id}`)
})


// EDIT ROUTE (PUT)
// Middleware that has already run ==> isComment, isLoggedIn, isAuthor, validateComment
module.exports.update = catchAsync(async (req, res, next) => {
	const { id, commentId } = req.params;
	// console.log(req.body.comment);
	const editedComment = await Comment.findByIdAndUpdate(commentId, { ...req.body.comment }, { new: true });
	if (req.user._id.equals(editedComment.author)) { // User ID is the comment author
		editedComment.timeCreated = new Date().toString().substring(0, 24) + ' SGT';
		await editedComment.save();
	}
	req.flash('success', 'Successfully updated comment!')
	return res.redirect(`/projects/${id}`);
})


// DESTROY ROUTE (DELETE)
// Middleware that has already run ==> isComment, isLoggedIn, isOwner
module.exports.delete = catchAsync(async (req, res, next) => {
	const { id, commentId } = req.params;
	const project = Project.findByIdAndUpdate(id, { $pull: { comments: commentId } })
	const comment = await Comment.findByIdAndDelete(req.params.commentId);
	req.flash('success', 'Successfully deleted comment!')
	res.redirect(`/projects/${id}`)
})