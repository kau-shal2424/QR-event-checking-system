const { Event, Participant, Admin } = require('../models');

/**
 * Get dashboard statistics
 * GET /stats/dashboard
 * @access Private (Admin only)
 */
const getDashboardStats = async (req, res) => {
    try {
        // 1. Get total counts
        const totalEvents = await Event.countDocuments();
        const totalParticipants = await Participant.countDocuments();
        const totalCheckedIn = await Participant.countDocuments({ checkedIn: true });

        // 2. Get recent check-ins (last 5)
        const recentCheckIns = await Participant.find({ checkedIn: true })
            .sort({ checkedInAt: -1 })
            .limit(5)
            .populate('eventId', 'name')
            .select('name email studentId checkedInAt eventId');

        // 3. Get participants per event (top 5 by participant count)
        // using aggregation for complex query
        const participantsPerEvent = await Participant.aggregate([
            {
                $group: {
                    _id: '$eventId',
                    count: { $sum: 1 },
                    checkedInCount: {
                        $sum: { $cond: [{ $eq: ['$checkedIn', true] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            { $unwind: '$event' },
            {
                $project: {
                    eventId: '$_id',
                    eventName: '$event.name',
                    totalParticipants: '$count',
                    checkedIn: '$checkedInCount'
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    events: totalEvents,
                    participants: totalParticipants,
                    checkedIn: totalCheckedIn,
                    pending: totalParticipants - totalCheckedIn
                },
                recentCheckIns,
                topEvents: participantsPerEvent
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats
};
