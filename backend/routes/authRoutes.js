const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// @route   POST /auth/register
// @desc    Register new admin
// @access  Public
router.post('/register', register);

// @route   POST /auth/login
// @desc    Login admin
// @access  Public
router.post('/login', login);

module.exports = router;
