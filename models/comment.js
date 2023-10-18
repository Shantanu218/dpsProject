const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	body: String,
	rating: Number,
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project' // Automatically creates a reference to tbe Project model. 
	},
	timeCreated: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User' // Automatically creates a reference to tbe Project model. 
	},
	username: String
});



module.exports = mongoose.model('Comment', commentSchema);
