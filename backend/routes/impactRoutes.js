const express = require('express');
const jwt = require('jsonwebtoken');
const { Impact, Event, WasteCollected } = require('../models');
const router = express.Router();

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

// Create/Update impact data for event
router.post('/:eventId', async (req, res) => {
  try {
    const { totalWasteCollected, volunteerParticipationCount, co2OffsetEstimation, wasteByType } = req.body;
    const eventId = req.params.eventId;

    // Verify event 
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find existing impact or create new one
    let impact = await Impact.findOne({ eventId });
    if (impact) {
      impact.totalWasteCollected = totalWasteCollected;
      impact.volunteerParticipationCount = volunteerParticipationCount;
      impact.co2OffsetEstimation = co2OffsetEstimation;
      impact.wasteByType = wasteByType;
    } else {
      impact = new Impact({
        eventId,
        totalWasteCollected,
        volunteerParticipationCount,
        co2OffsetEstimation,
        wasteByType
      });
    }

    await impact.save();

    res.json({
      success: true,
      message: 'Impact data saved successfully',
      data: impact
    });
  } catch (error) {
    console.error('Impact data error:', error);
    res.status(500).json({ message: 'Server error while saving impact data' });
  }
});

// Get impact data for event
router.get('/:eventId', async (req, res) => {
  try {
    const impact = await Impact.findOne({ eventId: req.params.eventId })
      .populate('eventId', 'name dateOfEvent beachName');
    
    if (!impact) {
      return res.status(404).json({ message: 'Impact data not found' });
    }

    res.json({ success: true, data: impact });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching impact data' });
  }
});

module.exports = router;