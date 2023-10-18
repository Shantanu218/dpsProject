
// CATCH ASYNC FUNCTION DECLARATION
const catchAsync = require('../utils/catchAsync');

// MODELS
const Project = require('../models/project');
const Comment = require('../models/comment');
const User = require('../models/user');

// IMPORTING NODEMAILER EMAIL SENDING FUNCTION
// const emailObj = require('../APIs/nodemailer'); // Object created with functions in it that can be referenced

// IMPORTING CLOUDINARY OBJECT FROM CLOUDINARY FILE
const { cloudinary } = require('../APIs/cloudinary') // Automatically checks in index.js

// FUNCTIONS
function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const expressErr = require('../utils/expressErr');


// HOME ROUTE (GET)
module.exports.home = (req, res) => {
	// res.cookie('Name', 'Shantanu');
	res.render('home') // Automatically renders home.ejs
}

// ADMIN ROUTE (GET)
module.exports.admin = catchAsync(async (req, res, next) => {
	let page = Number(req.query.page) || 0;
	if (page < 0)
		page = 0;
	const projectsPerPage = 30;

	let projects = await (Project.find({ isApproved: false }))
	// No projects are awaiting approval
	if (projects.length < 1) {
		return res.render('projects/adminApproval', { projects })
	}

	projects = await (Project.find({ isApproved: false }))
		.populate({ // Populate all comments from comments array (ref: Comment/model: Project)
			path: 'comments',
			populate: { path: 'author' } // Populate author for each comment (ref: User/model: Comment)
		})
		.populate('owner') // Populate owner of Project (ref: User/model: Project);
		.skip(page * projectsPerPage) // Skips the number of projects depending on the page input
		.limit(projectsPerPage)

	for (let project of projects) {
		if (project.owner == null) { // If the project doesn't have an owner (owner deleted their account)
			await Comment.deleteMany({ project: project._id })
			await project.deleteOne();
			return res.redirect(`/projects?page=${page}`)
		}
	}

	if (projects.length < 1) {
		req.flash('error', 'No more projects on that page! Please go to a different page!')
		return res.redirect(`/admin?page=${page - 1}`);
	}

	// Sort data logic
	if (req.query.sortData) {
		let sortTerm = req.query.sortData
		if (sortTerm == 'dateAsc') {
			// Compares in ascending order of timeCreated - Oldest to Newest
			function compare(a, b) {
				return Date.parse(b.timeCreated) - Date.parse(a.timeCreated)
			}
		} else if (sortTerm == 'dateDesc') {
			// Compares in descending order of timeCreated - Newest to Oldest
			function compare(a, b) {
				return Date.parse(b.timeCreated.substring(0, 24)) - Date.parse(a.timeCreated.substring(0, 24))
			}
		} else if (sortTerm == 'comAsc') {  // Compares in ascending order of number of comments
			function compare(a, b) {
				return a.comments.length - b.comments.length
			}
		} else if (sortTerm == 'comDesc') {  // Compares in descending order of number of comments
			function compare(a, b) {
				return b.comments.length - a.comments.length
			}
		} else if (sortTerm == 'atoz') {  // Compares in ascending order of title (A to Z) 
			function compare(a, b) {
				return a.title.localeCompare(b.title)
			}
		} else if (sortTerm == 'ztoa') {  // Compares in descending order of title (Z to A)
			function compare(a, b) {
				return b.title.localeCompare(a.title)
			}
		} else if (sortTerm == 'gradeAsc') {  // Compares in ascending order of grade (1 to 12) 
			function compare(a, b) {
				return a.grade - b.grade
			}
		} else if (sortTerm == 'gradeDesc') {  // Compares in descending order of grade (12 to 1) 
			function compare(a, b) {
				return b.grade - a.grade
			}
		} else {
			// sortTerm has invalid data, renders the projects
			return res.render('projects/index', { projects, page })
		}
		let sortedProjects = projects.sort(compare)
		// Prints out sorted projects
		// console.log(sortedProjects)
		projects = sortedProjects;
	}

	res.render('projects/adminApproval', { projects, page })
})

// INDEX ROUTE (GET)
module.exports.index = catchAsync(async (req, res, next) => {

	let page = Number(req.query.page) || 0;
	if (page < 0)
		page = 0;
	const projectsPerPage = 30;

	let projects = await (Project.find({ isApproved: true }))
	// All projects are awaiting approval
	if (projects.length < 1) {
		return res.render('projects/index', { projects, page })
	}

	projects = await (Project.find({ isApproved: true }))
		.populate({ // Populate all comments from comments array (ref: Comment/model: Project)
			path: 'comments',
			populate: { path: 'author' } // Populate author for each comment (ref: User/model: Comment)
		})
		.populate('owner') // Populate owner of Project (ref: User/model: Project);
		.skip(page * projectsPerPage) // Skips the number of projects depending on the page input
		.limit(projectsPerPage)

	for (let project of projects) {
		if (project.owner == null) { // If the project doesn't have an owner (owner deleted their account)
			await Comment.deleteMany({ project: project._id })
			await project.deleteOne();
			return res.redirect(`/projects?page=${page}`)
		}
	}

	// eval(require('locus')); => Useful for debugging using Node JS

	// Quick/Advanced search logic

	// Quick search logic
	if (req.query.type) {
		let { term, type, gradeOpt, subjectOpt, yearOpt } = req.query;
		const searchObj = {};
		let regex;

		if (type === 'grade') {
			regex = term = gradeOpt;
		} else if (type === 'subject') {
			regex = term = subjectOpt;
		} else if (type === 'year') {
			regex = term = yearOpt;
		} else {
			regex = new RegExp(escapeRegex(term), 'gi');
		}
		searchObj[ type ] = regex;
		projects = await Project.find(searchObj)
			.populate({ // Populate all comments from comments array (ref: Comment/model: Project)
				path: 'comments',
				populate: { path: 'author' } // Populate author for each comment (ref: User/model: Comment)
			})
			.populate('owner') // Populate owner of Project (ref: User/model: Project);
			.skip(page * projectsPerPage) // Skips the number of projects depending on the page input
			.limit(projectsPerPage)

		// let foundProjects = await Project.find({ $or: [ { title: regex }, { author: regex } ] })

		if (projects.length === 0) {
			req.flash('error', `No projects found, please try another query.`);
			return res.redirect('/projects');
		} else {
			res.locals.messages = { 'success': `Projects found with ${type} having '${term}'.` };
		}
	}
	if (req.query.search) {
		// Advanced search logic
		try {
			const objKeys = Object.keys(req.query.search); // Array of original object keys
			const objValues = Object.values(req.query.search); // Array of original object values

			const regexValues = [];  // Array containing non-empty regex values
			const nonEmptykeys = []; // Array containing non-empty object keys 

			for (let a = 0; a < objKeys.length; a++) {
				if (objValues[ a ] !== '') { // If the object property value is not empty
					if (objKeys[ a ] == 'title' || objKeys == 'description')
						regexValues[ a ] = new RegExp(escapeRegex(objValues[ a ]), 'gi'); // Regex expression for title and description
					else
						regexValues[ a ] = objValues[ a ];
					nonEmptykeys[ a ] = objKeys[ a ];
				}
			}
			const nonEmptyObj = {};
			nonEmptykeys.forEach((element, index) => {
				if (element !== undefined) {
					nonEmptyObj[ element ] = regexValues[ index ];
				}
			}); // Passes non-empty key-value pairs to the new object
			projects = await Project.find(nonEmptyObj)
				.populate({ // Populate all comments from comments array (ref: Comment/model: Project)
					path: 'comments',
					populate: { path: 'author' } // Populate author for each comment (ref: User/model: Comment)
				})
				.populate('owner') // Populate owner of Project (ref: User/model: Project);
				.skip(page * projectsPerPage) // Skips the number of projects depending on the page input
				.limit(projectsPerPage);
			if (projects.length === 0) {
				req.flash('error', 'No projects found with the given values.');
				return res.redirect('/projects');
			} else {
				res.locals.messages = { 'success': 'Projects found with the given values.' };
			}
		} catch (err) {
			console.log(err, ' Error at /controllers/projects.js (line 162)')
			// req.flash('error', 'No Projects found with the given values.');
			return res.redirect('/projects');
		}
	}
	// Renders all projects as quick/advanced search was not used
	// console.log(req.cookies);
	if (projects.length < 1) {
		req.flash('error', 'No more projects on that page! Please go to a different page!')
		return res.redirect(`/projects?page=${page - 1}`);
	}

	// Sort data logic
	if (req.query.sortData) {
		let sortTerm = req.query.sortData
		if (sortTerm == 'dateAsc') {
			// Compares in ascending order of timeCreated - Oldest to Newest
			function compare(a, b) {
				return Date.parse(b.timeCreated) - Date.parse(a.timeCreated)
			}
		} else if (sortTerm == 'dateDesc') {
			// Compares in descending order of timeCreated - Newest to Oldest
			function compare(a, b) {
				return Date.parse(b.timeCreated.substring(0, 24)) - Date.parse(a.timeCreated.substring(0, 24))
			}
		} else if (sortTerm == 'comAsc') {  // Compares in ascending order of number of comments
			function compare(a, b) {
				return a.comments.length - b.comments.length
			}
		} else if (sortTerm == 'comDesc') {  // Compares in descending order of number of comments
			function compare(a, b) {
				return b.comments.length - a.comments.length
			}
		} else if (sortTerm == 'atoz') {  // Compares in ascending order of title (A to Z) 
			function compare(a, b) {
				return a.title.localeCompare(b.title)
			}
		} else if (sortTerm == 'ztoa') {  // Compares in descending order of title (Z to A)
			function compare(a, b) {
				return b.title.localeCompare(a.title)
			}
		} else if (sortTerm == 'gradeAsc') {  // Compares in ascending order of grade (1 to 12) 
			function compare(a, b) {
				return a.grade - b.grade
			}
		} else if (sortTerm == 'gradeDesc') {  // Compares in descending order of grade (12 to 1) 
			function compare(a, b) {
				return b.grade - a.grade
			}
		} else {
			// sortTerm has invalid data, renders the projects
			return res.render('projects/index', { projects, page })
		}

		// Grabs all projects to sort
		projects = await (Project.find({ isApproved: true }))
			.populate({ // Populate all comments from comments array (ref: Comment/model: Project)
				path: 'comments',
				populate: { path: 'author' } // Populate author for each comment (ref: User/model: Comment)
			})
			.populate('owner') // Populate owner of Project (ref: User/model: Project);

		// Sorts out the projects based on the above criteria
		let sortedProjects = projects.sort(compare).slice(0, projectsPerPage) // Gives first 30 results
		projects = sortedProjects;
	}

	res.render('projects/index', { projects, page })
});

// SEARCH ROUTE (GET)
module.exports.search = (req, res) => {
	res.render('projects/advSearch');
};

// NEW ROUTE (GET)
module.exports.newForm = (req, res) => {
	res.render('projects/new');
}

// SHOW ROUTE (GET)
module.exports.show = catchAsync(async (req, res, next) => {

	let project = res.locals.foundProject;
	if (project.owner == null) {
		await Comment.deleteMany({ project: project._id })
		await project.deleteOne();
		return res.redirect(`/projects`)
	}

	let page = Number(req.query.page) || 0; // If page does not exist then it is given the value of 0
	if (page < 0)
		page = 0;
	const commentsPerPage = 5;

	const { id } = req.params; // Project ID
	const allComments = await Comment.find({ project: id })

	if (allComments.length < 1) { // Project has 0 comments
		project.comments.length = 0;
	} else {
		const foundComments = await (Comment.find({ project: id })) // Find all comments with project ID equal to params
			.skip(page * commentsPerPage)
			.limit(commentsPerPage)

		if (foundComments.length < 1) {
			req.flash('error', 'No more comments on that page! Please go to a different page!')
			return res.redirect(`/projects/${id}?page=${page - 1}`);
		}

		for (let comment of foundComments) {
			const commentAuthor = await User.findById(comment.author) // If the comment doesn't have an author (author deleted their account)
			if (commentAuthor == null) {
				await comment.deleteOne();
				return res.redirect(`/projects/${id}?page=${page}`);
			}
		}
		project.comments = foundComments;
	}
	return res.render('projects/show', { project, page })
})

// NEW ROUTE (POST)
module.exports.newPost = catchAsync(async (req, res, next) => {
	let imageArray = [];
	if (req.files) {
		for (let a = 0; a < req.files.length; a++) {
			imageArray.push(req.files[ a ])
		}
	}
	const project = new Project(req.body.project);
	project.timeCreated = new Date().toString().substring(0, 24) + ' SGT';
	project.owner = req.user._id
	project.images = imageArray;
	const id = project._id;
	project.isApproved = false;
	await project.save();
	// req.flash('success', 'Successfully made a new project!')
	req.flash('success', 'Success! Please wait for a teacher to approve your project!')
	// res.redirect(`/projects/${ id }`);
	res.redirect(`/projects`);
})

// EDIT ROUTE (GET)
module.exports.editForm = catchAsync(async (req, res, next) => {
	res.render('projects/edit', { project: res.locals.foundProject })
})

// EDIT ROUTE (PUT)
module.exports.editPost = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const project = await Project.findByIdAndUpdate(id, { ...req.body.project }, { new: true }) // Gives the updated project instead of the old project
	if (req.body.deleteImages) {
		for (let deleteImage of req.body.deleteImages) {
			await cloudinary.uploader.destroy(deleteImage) // Deletes the image from cloudinary account
		}
		await project.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
	}
	let imageArray = [];
	if (req.files.length > 0) {
		for (let a = 0; a < req.files.length; a++) {
			imageArray.push(req.files[ a ])
		}
	}
	project.images.push(...imageArray); // To add images onto array (May have duplicated images)
	// editedProject.images = imageArray; // To replace images with the array
	project.isApproved = false;
	await project.save();
	req.flash('success', 'Success! Please wait for a teacher to approve your project!')
	res.redirect(`/projects`);
})

// APPROVE ROUTE (POST)
module.exports.approve = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const project = res.locals.foundProject;
	project.isApproved = true;
	await project.save();
	req.flash('success', 'Successfully approved project!')
	return res.redirect(`/admin`);
})

// DELETE ROUTE (DELETE)
module.exports.delete = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const project = await Project.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted project!')
	res.redirect('/projects')
})