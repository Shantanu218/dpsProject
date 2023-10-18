const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, storeReturnTo } = require('../middleware/projectMiddleware');
const userObj = require('../controllers/users');


// REGISTER ROUTE (GET)
router.get('/register', userObj.registerPage);

// REGISTER ROUTE (POST)
router.post('/register', userObj.register);

// LOGIN ROUTE (GET)
router.get('/login', userObj.loginPage);

// LOGIN ROUTE (POST)
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), userObj.login);

// RESET ROUTE (GET)
router.get('/reset', userObj.reset);

// LOGOUT ROUTE (GET)
router.get('/logout', isLoggedIn, userObj.logout);


module.exports = router;