// routes/volunteerDashboardRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
    Volunteer,
    Event,
    Impact,
    WasteCollected,
    WasteInformation
} = require('../models'); // Adjust this path to where your models are defined

// Helper function to aggregate waste data by category and type
const aggregateWasteData = (wasteEntries) => {
    const wasteBreakdown = {};
    const wasteCategoryDistribution = {};

    wasteEntries.forEach(waste => {
        const { category, type, weight } = waste;

        if (!wasteBreakdown[type]) {
            wasteBreakdown[type] = 0;
        }
        wasteBreakdown[type] += weight;

        if (!wasteCategoryDistribution[category]) {
            wasteCategoryDistribution[category] = 0;
        }
        wasteCategoryDistribution[category] += weight;
    });

    const wasteBreakdownArray = Object.keys(wasteBreakdown).map(type => ({
        type,
        weight: wasteBreakdown[type]
    }));

    const wasteCategoryDistributionArray = Object.keys(wasteCategoryDistribution).map(category => ({
        category,
        weight: wasteCategoryDistribution[category]
    }));

    return { wasteBreakdownArray, wasteCategoryDistributionArray };
};

// GET /api/volunteer/dashboard/:volunteerId
// Fetches dashboard data for a specific volunteer
router.get('/:volunteerId', async (req, res) => {
    try {
        const { volunteerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
            return res.status(400).json({ message: 'Invalid volunteer ID.' });
        }

        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found.' });
        }

        const participatedEventIds = volunteer.participationHistory;

        // Fetch details of events the volunteer participated in
        const participatedEvents = await Event.find({ _id: { $in: participatedEventIds } });

        // Aggregate total waste collected by this volunteer
        const totalWasteCollectedByVolunteer = await WasteCollected.aggregate([
            { $match: { volunteerId: new mongoose.Types.ObjectId(volunteerId) } },
            { $group: { _id: null, totalWeight: { $sum: '$weight' } } }
        ]);
        const volunteerTotalWaste = totalWasteCollectedByVolunteer.length > 0 ? totalWasteCollectedByVolunteer[0].totalWeight : 0;

        // Fetch all waste collected entries by this specific volunteer across all their events
        const volunteerWasteCollectedEntries = await WasteCollected.find({ volunteerId: new mongoose.Types.ObjectId(volunteerId) });
        const { wasteBreakdownArray, wasteCategoryDistributionArray } = aggregateWasteData(volunteerWasteCollectedEntries);

        // Sum CO2 Offset from events the volunteer participated in (as a proxy for their contribution)
        let totalCo2OffsetFromParticipatedEvents = 0;
        if (participatedEventIds.length > 0) {
            const impacts = await Impact.find({ eventId: { $in: participatedEventIds } });
            impacts.forEach(impact => {
                totalCo2OffsetFromParticipatedEvents += impact.co2OffsetEstimation || 0;
            });
        }

        // Fetch waste information for the types of waste collected by this volunteer
        const uniqueWasteTypesCollected = [...new Set(volunteerWasteCollectedEntries.map(w => w.type))];
        const uniqueWasteCategoriesCollected = [...new Set(volunteerWasteCollectedEntries.map(w => w.category))];

        const wasteInformationData = await WasteInformation.find({
            $or: [
                { subcategory: { $in: uniqueWasteTypesCollected } },
                { category: { $in: uniqueWasteCategoriesCollected } }
            ]
        });

        // Prepare data for the 2x2 cards (take a representative sample or average if multiple)
        const sampleWasteInfo = wasteInformationData.length > 0 ? wasteInformationData[0] : {};

        // Volunteer's individual waste collection trend
        const volunteerWasteCollectionTrend = await WasteCollected.aggregate([
            { $match: { volunteerId: new mongoose.Types.ObjectId(volunteerId) } },
            {
                $group: {
                    _id: {
                        year: { $year: '$collectionDate' },
                        month: { $month: '$collectionDate' },
                        day: { $dayOfMonth: '$collectionDate' }
                    },
                    totalWeight: { $sum: '$weight' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
            { $project: { _id: 0, date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' } }, totalWeight: 1 } }
        ]);

        res.status(200).json({
            volunteerStats: {
                name: volunteer.name,
                email: volunteer.email,
                totalEventsParticipated: participatedEventIds.length,
                totalWasteCollected: volunteerTotalWaste,
                rewardPoints: volunteer.rewardPoints,
                totalCo2OffsetFromParticipatedEvents: totalCo2OffsetFromParticipatedEvents
            },
            participationHistory: participatedEvents.map(event => ({
                _id: event._id,
                name: event.name,
                dateOfEvent: event.dateOfEvent,
                beachName: event.beachName,
                // You might want to add individual waste collected for this event here too if needed
            })),
            volunteerAchievements: volunteer.achievements,
            wasteBreakdown: wasteBreakdownArray,
            wasteCategoryDistribution: wasteCategoryDistributionArray,
            wasteInformationCards: {
                decompositionTime: sampleWasteInfo.decomposition_time_days || 'N/A',
                carbonFootprint: sampleWasteInfo.carbon_footprint_per_kg || 'N/A',
                recyclable: sampleWasteInfo.recyclable !== undefined ? sampleWasteInfo.recyclable : 'N/A',
                marineLifeThreatLevel: sampleWasteInfo.marine_life_threat_level || 'N/A'
            },
            volunteerWasteCollectionTrend: volunteerWasteCollectionTrend,
        });

    } catch (error) {
        console.error('Error fetching volunteer dashboard data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;