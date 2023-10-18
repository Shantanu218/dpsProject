const { boolean } = require('joi');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true // You still need to add a validation middleware
	},
	isAdmin: Boolean,
})

userSchema.plugin(passportLocalMongoose, { usernameQueryFields: [ "email" ] }); // Adds on a username and password field. Check docs. 
// usernameQueryFields: ["email"] allows login using email as well 

module.exports = mongoose.model('User', userSchema);
