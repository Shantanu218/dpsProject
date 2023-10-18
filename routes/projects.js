const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const expressErr = require('../utils/expressErr');
const Project = require('../models/project');
const { joiProjectSchema, joiCommentSchema } = require('../joiSchemas')
const { isLoggedIn, isProject, isAdmin, isOwner, validateProject } = require('../middleware/projectMiddleware')
const commentObj = require('../controllers/comments');
const projectObj = require('../controllers/projects');
const multer = require('multer');

// CLOUDINARY CONFIG
const { storage } = require('../APIs/cloudinary') // Checks in index.js file automatically

const upload = multer({
	storage,
	limits: { fileSize: 200000000, files: 6 } // File size in Bytes (200 MB)
}); // Stored according to cloudinary config file



// const validateProject = (req, res, next) => {
// 	const result = joiProjectSchema.validate(req.body); // Video 457
// 	if (result.error) {
// 		const message = result.error.details.map(el => el.message).join(',');
// 		// console.log('JOI ERROR');
// 		// console.log(result);
// 		throw new expressErr(message, 400);
// 	}
// 	else {
// 		next();
// 	}
// }


// router.get('/project', async (req, res) => {
// 	const proj = new Project({ title: 'My background' });
// 	await proj.save();
// 	res.send(proj );
// });


// HOME ROUTE (GET)
router.get('/', projectObj.home);


// ADMIN ROUTE (GET)
router.get('/admin', isLoggedIn, isAdmin, projectObj.admin);

// INDEX ROUTE (GET)
router.get('/projects', projectObj.index)

// NEW ROUTE (GET)
router.get('/projects/new', isLoggedIn, projectObj.newForm);

// SEARCH ROUTE (GET)
router.get('/projects/search', projectObj.search);

// SHOW ROUTE (GET)
router.get('/projects/:id', isProject, projectObj.show);

// NEW ROUTE (POST)
router.post('/projects', isLoggedIn, upload.array('image'), validateProject, projectObj.newPost); // Keep it image as the form passes it with the key of "image"

// EDIT ROUTE (GET)
router.get('/projects/:id/edit', isProject, isLoggedIn, isAdmin, projectObj.editForm);

// APPROVE ROUTE (POST)
router.post('/projects/:id/approve', isProject, isLoggedIn, isAdmin, projectObj.approve);

// EDIT ROUTE (PUT)
router.put('/projects/:id', isProject, isLoggedIn, isAdmin, upload.array('image'), validateProject, projectObj.editPost);



// DELETE ROUTE (DELETE)
router.delete('/projects/:id', isProject, isLoggedIn, isAdmin, projectObj.delete);

module.exports = router;
