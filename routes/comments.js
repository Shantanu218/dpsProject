const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware/projectMiddleware');
const { isComment, validateComment, isAuthor } = require('../middleware/commentMiddleware');
const commentObj = require('../controllers/comments');


// NEW ROUTE (POST)
router.post('/projects/:id/comments', isLoggedIn, isAdmin, validateComment, commentObj.new);

// EDIT ROUTE (PUT)
router.put('/projects/:id/comments/:commentId', isComment, isLoggedIn, isAuthor, validateComment, commentObj.update)

// DELETE ROUTE (DELETE)
router.delete('/projects/:id/comments/:commentId', isComment, isLoggedIn, isAuthor, commentObj.delete);

module.exports = router;