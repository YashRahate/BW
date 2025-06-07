const express = require('express');
const jwt = require('jsonwebtoken');
const { Event, Volunteer, Impact, WasteCollected, Beach } = require('../models');

const router = express.Router();

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.organizerId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get dashboard statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Get organizer's events
    const organizerEvents = await Event.find({ organizerId: req.organizerId });
    const eventIds = organizerEvents.map(event => event._id);

    // Total events
    const totalEvents = organizerEvents.length;

    // Upcoming events
    const upcomingEvents = organizerEvents.filter(event => 
      event.status === 'upcoming' && new Date(event.dateOfEvent) > new Date()
    ).length;

    // Completed events
    const completedEvents = organizerEvents.filter(event => 
      event.status === 'completed' || new Date(event.dateOfEvent) < new Date()
    ).length;

    // Total volunteers registered
    const totalVolunteersRegistered = organizerEvents.reduce((sum, event) => 
      sum + event.volunteerRegisterCount, 0
    );

    // Total waste collected
    const wasteCollected = await WasteCollected.find({ eventId: { $in: eventIds } });
    const totalWasteCollected = wasteCollected.reduce((sum, waste) => sum + waste.weight, 0);

    // Waste by type
    const wasteByType = {};
    wasteCollected.forEach(waste => {
      wasteByType[waste.type] = (wasteByType[waste.type] || 0) + waste.weight;
    });

    // Equipment calculation (basic estimation)
    const equipmentNeeded = {
      gloves: Math.ceil(totalVolunteersRegistered * 1.2), // 20% extra
      bags: Math.ceil(totalVolunteersRegistered * 0.3), // 3-4 volunteers per bag
      pickupTools: Math.ceil(totalVolunteersRegistered * 0.5), // 2 volunteers per tool
      firstAidKits: Math.ceil(totalVolunteersRegistered / 50), // 1 kit per 50 volunteers
      waterBottles: totalVolunteersRegistered
    };

    // Recent events
    const recentEvents = await Event.find({ organizerId: req.organizerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('registeredVolunteers', 'name');

    // Impact data
    const impactData = await Impact.find({ eventId: { $in: eventIds } });
    const totalCO2Offset = impactData.reduce((sum, impact) => sum + (impact.co2OffsetEstimation || 0), 0);

    res.json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalVolunteersRegistered,
        totalWasteCollected,
        wasteByType,
        equipmentNeeded,
        recentEvents,
        totalCO2Offset,
        impactData
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
});

// Get event analytics
router.get('/analytics/:eventId', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('registeredVolunteers', 'name email rewardPoints')
      .populate('organizerId', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if organizer owns this event
    if (event.organizerId._id.toString() !== req.organizerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get waste data for this event
    const wasteData = await WasteCollected.find({ eventId: req.params.eventId });
    const impactData = await Impact.findOne({ eventId: req.params.eventId });

    // Calculate waste by type
    const wasteByType = {};
    wasteData.forEach(waste => {
      wasteByType[waste.type] = (wasteByType[waste.type] || 0) + waste.weight;
    });

    // Calculate volunteer participation rate
    const participationRate = event.registeredVolunteers.length > 0 
      ? (wasteData.length / event.registeredVolunteers.length) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        event,
        wasteData,
        wasteByType,
        impactData,
        participationRate,
        totalWasteCollected: wasteData.reduce((sum, waste) => sum + waste.weight, 0)
      }
    });
  } catch (error) {
    console.error('Event analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching event analytics' });
  }
});

// Get volunteers for an event
router.get('/event/:eventId/volunteers', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('registeredVolunteers', 'name email mobileNo address age gender participationHistory rewardPoints');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if organizer owns this event
    if (event.organizerId.toString() !== req.organizerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        eventName: event.name,
        volunteers: event.registeredVolunteers
      }
    });
  } catch (error) {
    console.error('Event volunteers error:', error);
    res.status(500).json({ message: 'Server error while fetching event volunteers' });
  }
});

module.exports = router;