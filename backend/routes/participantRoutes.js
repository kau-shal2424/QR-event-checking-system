const express = require('express');
const router = express.Router();
const {
    uploadParticipants,
    getParticipantsByEvent,
    checkIn,
    getParticipantById
} = require('../controllers/participantController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../config/multer');

// @route   POST /participants/upload/:eventId
// @desc    Upload participants from CSV file
// @access  Private (Admin only)
router.post('/upload/:eventId', protect, adminOnly, upload.single('file'), uploadParticipants);

// @route   GET /participants/event/:eventId
// @desc    Get all participants for an event
// @access  Public
router.get('/event/:eventId', getParticipantsByEvent);

// @route   POST /participants/checkin
// @desc    Check in participant using QR token
// @access  Public
router.post('/checkin', checkIn);

// @route   GET /participants/:id
// @desc    Get participant details (ticket view)
// @access  Public
router.get('/:id', getParticipantById);

module.exports = router;
