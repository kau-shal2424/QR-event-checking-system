const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID is required']
    },
    name: {
        type: String,
        required: [true, 'Participant name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        trim: true
    },
    qrTokenHash: {
        type: String,
        required: [true, 'QR token hash is required'],
    },
    qrToken: { // Storing raw token for display/regeneration purposes
        type: String,
        required: [true, 'QR token is required'],
        select: false // Hide by default for security, explicitly select when needed
    },
    checkedIn: {
        type: Boolean,
        default: false
    },
    checkedInAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Unique compound index on eventId and studentId (prevents duplicate registrations)
participantSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

// Index on eventId and email for faster lookups
participantSchema.index({ eventId: 1, email: 1 });

// Index for status filtering (admin dashboard)
participantSchema.index({ eventId: 1, checkedIn: 1 });

// Unique index for QR token hash
participantSchema.index({ qrTokenHash: 1 }, { unique: true });

module.exports = mongoose.model('Participant', participantSchema);
