// routes/globalDashboardRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
    Organizer, // Included just in case for future use, though not directly queried for global events
    Event,
    Volunteer,
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

// GET /api/global/dashboard/overall
// Fetches overall dashboard data for ALL organizers and events
router.get('/overall', async (req, res) => {
    try {
        // Fetch all events from all organizers
        const events = await Event.find({});

        let totalEvents = events.length;
        let totalVolunteerRegistered = 0;
        let totalWasteCollected = 0;
        let totalCo2Offset = 0;

        const eventIds = events.map(event => event._id);

        // Aggregate data from Impact schema for overall totals
        const impacts = await Impact.find({ eventId: { $in: eventIds } });

        impacts.forEach(impact => {
            totalWasteCollected += impact.totalWasteCollected || 0;
            totalVolunteerRegistered += impact.volunteerParticipationCount || 0;
            totalCo2Offset += impact.co2OffsetEstimation || 0;
        });

        // Fetch all waste collection entries for detailed breakdown
        const allWasteCollectedEntries = await WasteCollected.find({ eventId: { $in: eventIds } });
        const { wasteBreakdownArray, wasteCategoryDistributionArray } = aggregateWasteData(allWasteCollectedEntries);

        // Fetch waste information for decomposition, carbon footprint, etc.
        const uniqueWasteTypes = [...new Set(allWasteCollectedEntries.map(w => w.type))];
        const uniqueWasteCategories = [...new Set(allWasteCollectedEntries.map(w => w.category))];

        const wasteInformationData = await WasteInformation.find({
            $or: [{ subcategory: { $in: uniqueWasteTypes } }, { category: { $in: uniqueWasteCategories } }]
        });

        // Prepare data for the 2x2 cards (take a representative sample if multiple, or average)
        const sampleWasteInfo = wasteInformationData.length > 0 ? wasteInformationData[0] : {};


        // Top contributors (volunteers) across all events
        const topContributors = await WasteCollected.aggregate([
            { $group: { _id: '$volunteerId', totalWeight: { $sum: '$weight' } } },
            { $sort: { totalWeight: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'volunteers', // The collection name for Volunteer schema
                    localField: '_id',
                    foreignField: '_id',
                    as: 'volunteerDetails'
                }
            },
            { $unwind: '$volunteerDetails' },
            { $project: { _id: 0, volunteerName: '$volunteerDetails.name', totalWasteCollected: '$totalWeight' } }
        ]);

        // Event timeline and volunteer registration trend for all events
        const eventTimeline = events.map(event => ({
            eventName: event.name,
            dateOfEvent: event.dateOfEvent,
            volunteerRegisterCount: event.volunteerRegisterCount
        })).sort((a, b) => new Date(a.dateOfEvent) - new Date(b.dateOfEvent));

        // Waste collection trend across all events
        const wasteCollectionTrend = await WasteCollected.aggregate([
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
            overallStats: {
                totalEvents,
                totalVolunteerRegistered,
                totalWasteCollected,
                totalCo2Offset
            },
            eventList: events.map(event => ({
                _id: event._id,
                name: event.name,
                dateOfEvent: event.dateOfEvent,
                beachName: event.beachName
            })),
            wasteBreakdown: wasteBreakdownArray,
            wasteCategoryDistribution: wasteCategoryDistributionArray,
            wasteInformationCards: {
                decompositionTime: sampleWasteInfo.decomposition_time_days || 'N/A',
                carbonFootprint: sampleWasteInfo.carbon_footprint_per_kg || 'N/A',
                recyclable: sampleWasteInfo.recyclable !== undefined ? sampleWasteInfo.recyclable : 'N/A',
                marineLifeThreatLevel: sampleWasteInfo.marine_life_threat_level || 'N/A'
            },
            topContributors,
            eventTimeline,
            wasteCollectionTrend,
        });

    } catch (error) {
        console.error('Error fetching global dashboard data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/global/dashboard/event/:eventId
// Fetches dashboard data for a specific event (same logic as admin, but exposed under global route)
router.get('/event/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: 'Invalid event ID.' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const impact = await Impact.findOne({ eventId });
        const wasteCollectedEntries = await WasteCollected.find({ eventId });

        let totalWasteCollected = impact ? impact.totalWasteCollected : 0;
        let totalVolunteerRegistered = event.volunteerRegisterCount;
        let totalCo2Offset = impact ? impact.co2OffsetEstimation : 0;

        const { wasteBreakdownArray, wasteCategoryDistributionArray } = aggregateWasteData(wasteCollectedEntries);

        const uniqueWasteTypes = [...new Set(wasteCollectedEntries.map(w => w.type))];
        const uniqueWasteCategories = [...new Set(wasteCollectedEntries.map(w => w.category))];

        const wasteInformationData = await WasteInformation.find({
            $or: [{ subcategory: { $in: uniqueWasteTypes } }, { category: { $in: uniqueWasteCategories } }]
        });

        const sampleWasteInfo = wasteInformationData.length > 0 ? wasteInformationData[0] : {};

        const topContributors = await WasteCollected.aggregate([
            { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
            { $group: { _id: '$volunteerId', totalWeight: { $sum: '$weight' } } },
            { $sort: { totalWeight: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'volunteers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'volunteerDetails'
                }
            },
            { $unwind: '$volunteerDetails' },
            { $project: { _id: 0, volunteerName: '$volunteerDetails.name', totalWasteCollected: '$totalWeight' } }
        ]);

        const eventTimeline = [{
            eventName: event.name,
            dateOfEvent: event.dateOfEvent,
            volunteerRegisterCount: event.volunteerRegisterCount
        }];

        const wasteCollectionTrend = await WasteCollected.aggregate([
            { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
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
            overallStats: {
                totalEvents: 1, // Always 1 for a specific event view
                totalVolunteerRegistered,
                totalWasteCollected,
                totalCo2Offset
            },
            eventList: [{
                _id: event._id,
                name: event.name,
                dateOfEvent: event.dateOfEvent,
                beachName: event.beachName
            }],
            wasteBreakdown: wasteBreakdownArray,
            wasteCategoryDistribution: wasteCategoryDistributionArray,
            wasteInformationCards: {
                decompositionTime: sampleWasteInfo.decomposition_time_days || 'N/A',
                carbonFootprint: sampleWasteInfo.carbon_footprint_per_kg || 'N/A',
                recyclable: sampleWasteInfo.recyclable !== undefined ? sampleWasteInfo.recyclable : 'N/A',
                marineLifeThreatLevel: sampleWasteInfo.marine_life_threat_level || 'N/A'
            },
            topContributors,
            eventTimeline,
            wasteCollectionTrend,
        });

    } catch (error) {
        console.error('Error fetching specific event dashboard data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;