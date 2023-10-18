const baseJoi = require('joi');
const escapeHTML = require('sanitize-html');

const extension = (joi) => ({
	type: 'string',
	base: joi.string(),
	messages: {
		// 'string.escapeHTML': '{{#label}} must not include HTML!'
		'string.escapeHTML': 'Your inputs must not include HTML!'
	},
	rules: {
		escapeHTML: {
			validate(value, helpers) {
				const clean = escapeHTML(value, {
					allowedTags: [],
					allowedAttributes: {},
				});
				if (clean !== value)
					return helpers.error('string.escapeHTML', { value })
				return clean;
			}
		}
	}

});

const Joi = baseJoi.extend(extension)

module.exports.joiProjectSchema = Joi.object({ // Makes a JOI object and helps in validation
	project: Joi.object({
		title: Joi.string().required().escapeHTML(),
		subject: Joi.string().required().escapeHTML(),
		description: Joi.string().required().escapeHTML(),
		// image: Joi.string(),
		grade: Joi.number().required(),
		section: Joi.string().required().escapeHTML(),
		year: Joi.number().required().min(2000).max(2100),
	}).required(),
	deleteImages: Joi.array()
});


module.exports.joiCommentSchema = Joi.object({ // Makes a JOI object and helps in validation
	comment: Joi.object({
		rating: Joi.number().required().min(1).max(5),
		body: Joi.string().required().escapeHTML(),
		project: Joi.string().hex().length(24).escapeHTML(), // Code to ensure that project is an objectID
		timeCreated: Joi.string().escapeHTML()
	}).required()
});
