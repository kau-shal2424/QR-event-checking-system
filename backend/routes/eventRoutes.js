const express = require('express');
const router = express.Router();
const {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /events
// @desc    Create new event
// @access  Private (Admin only)
router.post('/', protect, adminOnly, createEvent);

// @route   GET /events
// @desc    Get all events
// @access  Public
router.get('/', getAllEvents);

// @route   GET /events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', getEventById);

// @route   PUT /events/:id
// @desc    Update event
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, updateEvent);

// @route   DELETE /events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
