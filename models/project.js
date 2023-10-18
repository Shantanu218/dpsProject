const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./comment')

const imageSchema = new mongoose.Schema({
	originalname: String,
	mimetype: String,
	path: String,
	size: Number,
	filename: String
})

imageSchema.virtual('thumbnail').get(function () {
	return this.path.replace('/upload', '/upload/w_738'); // this refers to the particular image
	// 'replace' replaces the first match
});

const projectSchema = new Schema({
	title: String,
	subject: String,
	description: String,
	images: [ imageSchema ],
	grade: Number,
	section: String,
	timeCreated: String,
	year: Number,
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User' // Automatically creates a reference to the User model. 
	},
	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Comment' // Automatically creates a reference to the Comment model. 
		}
	],
	isApproved: Boolean
})

projectSchema.post('findOneAndDelete', async function (doc) {
	if (doc) {
		const id = doc._id;
		const comments = await Comment.deleteMany({ project: id })
		// console.log(doc);
		// console.log(comments);
	}
})

module.exports = mongoose.model('Project', projectSchema);
