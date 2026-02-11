const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /stats/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', protect, adminOnly, getDashboardStats);

module.exports = router;
