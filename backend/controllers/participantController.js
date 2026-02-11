const { Participant, Event } = require('../models');
const { parseCSV, validateCSVData } = require('../utils/csvParser');
const { generateQRToken } = require('../utils/qrToken');

/**
 * Upload participants from CSV file
 * POST /participants/upload/:eventId
 * @access Private (Admin only)
 */
const uploadParticipants = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a CSV file'
            });
        }

        // Verify event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Parse CSV file
        let parsedData;
        try {
            parsedData = await parseCSV(req.file.buffer);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Error parsing CSV file',
                error: error.message
            });
        }

        // Validate CSV data
        const validation = validateCSVData(parsedData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'CSV validation failed',
                errors: validation.errors
            });
        }

        // Check for duplicates in database
        const emails = parsedData.map(p => p.email);
        const studentIds = parsedData.map(p => p.studentId);

        const existingParticipants = await Participant.find({
            eventId,
            $or: [
                { email: { $in: emails } },
                { studentId: { $in: studentIds } }
            ]
        });

        // Create a set of existing email-studentId combinations
        const existingSet = new Set(
            existingParticipants.map(p => `${p.email}|${p.studentId}`)
        );

        // Separate new and duplicate participants
        const newParticipants = [];
        const duplicates = [];

        parsedData.forEach(row => {
            const key = `${row.email}|${row.studentId}`;
            if (existingSet.has(key)) {
                duplicates.push(row);
            } else {
                newParticipants.push(row);
            }
        });

        // If no new participants, return early
        if (newParticipants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All participants already exist in the database',
                duplicates: duplicates.length,
                total: parsedData.length
            });
        }

        // Prepare bulk write operations and collect tokens
        const generatedTokens = [];

        const bulkOps = newParticipants.map(participant => {
            // Generate ID upfront to use in token
            const participantId = new mongoose.Types.ObjectId();
            const { token, hash } = generateSecureToken(eventId, participantId.toString());

            // Collect token for response (so admin can distribute)
            generatedTokens.push({
                email: participant.email,
                name: participant.name,
                studentId: participant.studentId,
                token: token
            });

            return {
                insertOne: {
                    document: {
                        _id: participantId,
                        eventId,
                        name: participant.name.trim(),
                        email: participant.email.trim().toLowerCase(),
                        studentId: participant.studentId.trim(),
                        qrTokenHash: hash,
                        qrToken: token, // Save the token
                        checkedIn: false,
                        checkedInAt: null
                    }
                }
            };
        });

        // Execute bulk write
        const result = await Participant.bulkWrite(bulkOps);

        res.status(201).json({
            success: true,
            message: 'Participants uploaded successfully',
            data: {
                inserted: result.insertedCount,
                duplicates: duplicates.length,
                total: parsedData.length,
                event: {
                    id: event._id,
                    name: event.name,
                    slug: event.slug
                },
                participants: generatedTokens // Return tokens for distribution
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading participants',
            error: error.message
        });
    }
};

/**
 * Get all participants for an event
 * GET /participants/event/:eventId
 * @access Public
 */
/**
 * Get all participants for an event (with search, filter, pagination)
 * GET /participants/event/:eventId
 * Query Params: search, status, page, limit
 * @access Public (or Admin)
 */
const getParticipantsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { search, status, page = 1, limit = 50 } = req.query;

        // Verify event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Build query
        const query = { eventId };

        // Search logic (name, email, or studentId)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { studentId: searchRegex }
            ];
        }

        // Status filter
        if (status === 'checkedIn') {
            query.checkedIn = true;
        } else if (status === 'notCheckedIn') {
            query.checkedIn = false;
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query
        const participants = await Participant.find(query)
            .select('-qrTokenHash') // Exclude sensitive hash
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Participant.countDocuments(query);

        res.status(200).json({
            success: true,
            count: participants.length,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            },
            data: participants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching participants',
            error: error.message
        });
    }
};

/**
 * Check in participant using QR token
 * POST /participants/checkin
 * @access Public
 */
/**
 * Check in participant using QR token (Atomic)
 * POST /participants/checkin
 * @access Public
 */
const checkIn = async (req, res) => {
    try {
        const { token, eventId } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a QR token'
            });
        }

        // Hash the token
        const crypto = require('crypto');
        const qrTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // 1. First find the participant to check status (for specific error messages)
        const participant = await Participant.findOne({ qrTokenHash });

        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Invalid QR code. Participant not found.'
            });
        }

        // Optional: specific event check
        if (eventId && participant.eventId.toString() !== eventId) {
            return res.status(400).json({
                success: false,
                message: 'This QR code is for a different event.'
            });
        }

        // 2. Check if already checked in
        if (participant.checkedIn) {
            // Populate event details for response
            await participant.populate('eventId', 'name');

            return res.status(409).json({
                success: false,
                message: `Already checked in at ${participant.checkedInAt.toLocaleTimeString()}`,
                data: {
                    name: participant.name,
                    studentId: participant.studentId,
                    email: participant.email,
                    event: participant.eventId.name,
                    checkedInAt: participant.checkedInAt
                }
            });
        }

        // 3. Atomically update status
        const updatedParticipant = await Participant.findOneAndUpdate(
            {
                _id: participant._id,
                checkedIn: false // Ensure we only update if still not checked in (race condition check)
            },
            {
                $set: {
                    checkedIn: true,
                    checkedInAt: new Date()
                }
            },
            { new: true }
        ).populate('eventId', 'name');

        if (!updatedParticipant) {
            // This case handles the race condition where another request checked them in between steps 2 and 3
            return res.status(409).json({
                success: false,
                message: 'Already checked in (race condition detected)',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Check-in successful! Welcome!',
            data: {
                name: updatedParticipant.name,
                studentId: updatedParticipant.studentId,
                email: updatedParticipant.email,
                event: updatedParticipant.eventId.name,
                checkedInAt: updatedParticipant.checkedInAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing check-in',
            error: error.message
        });
    }
};

/**
 * Get single participant by ID (for Ticket Page)
 * GET /participants/:id
 * @access Public
 */
const getParticipantById = async (req, res) => {
    try {
        const participant = await Participant.findById(req.params.id)
            .populate('eventId', 'name location dateTime')
            .select('+qrToken'); // Explicitly select the hidden token

        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }

        res.status(200).json({
            success: true,
            data: participant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching participant',
            error: error.message
        });
    }
};

module.exports = {
    uploadParticipants,
    getParticipantsByEvent,
    checkIn,
    getParticipantById
};
