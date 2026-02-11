const { Event } = require('../models');

/**
 * Create new event
 * POST /events
 * @access Private (Admin only)
 */
const createEvent = async (req, res) => {
    try {
        const { name, slug, dateTime, location } = req.body;

        // Validate input
        if (!name || !slug || !dateTime || !location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, slug, dateTime, location'
            });
        }

        // Check if event with slug already exists
        const existingEvent = await Event.findOne({ slug });
        if (existingEvent) {
            return res.status(400).json({
                success: false,
                message: 'Event with this slug already exists'
            });
        }

        // Create event
        const event = await Event.create({
            name,
            slug,
            dateTime,
            location
        });

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
};

/**
 * Get all events
 * GET /events
 * @access Public
 */
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ dateTime: -1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
};

/**
 * Get event by ID
 * GET /events/:id
 * @access Public
 */
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        // Handle invalid ObjectId
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error fetching event',
            error: error.message
        });
    }
};

/**
 * Update event
 * PUT /events/:id
 * @access Private (Admin only)
 */
const updateEvent = async (req, res) => {
    try {
        const { name, slug, dateTime, location } = req.body;

        // Find event
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // If slug is being updated, check if new slug already exists
        if (slug && slug !== event.slug) {
            const existingEvent = await Event.findOne({ slug });
            if (existingEvent) {
                return res.status(400).json({
                    success: false,
                    message: 'Event with this slug already exists'
                });
            }
        }

        // Update event
        event = await Event.findByIdAndUpdate(
            req.params.id,
            { name, slug, dateTime, location },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });
    } catch (error) {
        // Handle invalid ObjectId
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
};

/**
 * Delete event
 * DELETE /events/:id
 * @access Private (Admin only)
 */
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully',
            data: {}
        });
    } catch (error) {
        // Handle invalid ObjectId
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};
