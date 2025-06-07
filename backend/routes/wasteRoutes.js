// routes/wasteRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { WasteCollected, Event, Volunteer } = require('../models');
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

// Add waste collection data
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { eventId, volunteerId, type, weight } = req.body;

    // Verify event belongs to organizer
    const event = await Event.findById(eventId);
    if (!event || event.organizerId.toString() !== req.organizerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const wasteRecord = new WasteCollected({
      eventId,
      volunteerId,
      type,
      weight
    });

    await wasteRecord.save();

    // Update volunteer's total waste collected
    if (volunteerId) {
      await Volunteer.findByIdAndUpdate(volunteerId, {
        $inc: { wasteCollected: weight, rewardPoints: Math.floor(weight * 10) }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Waste data recorded successfully',
      data: wasteRecord
    });
  } catch (error) {
    console.error('Waste recording error:', error);
    res.status(500).json({ message: 'Server error while recording waste data' });
  }
});

// Get waste data for event
router.get('/event/:eventId', verifyToken, async (req, res) => {
  try {
    const wasteData = await WasteCollected.find({ eventId: req.params.eventId })
      .populate('volunteerId', 'name email')
      .sort({ collectionDate: -1 });

    res.json({ success: true, data: wasteData });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching waste data' });
  }
});

// Get waste statistics
router.get('/stats/:eventId', verifyToken, async (req, res) => {
  try {
    const wasteData = await WasteCollected.find({ eventId: req.params.eventId });
    
    const stats = {
      totalWeight: 0,
      byType: {},
      byVolunteer: {}
    };

    wasteData.forEach(waste => {
      stats.totalWeight += waste.weight;
      stats.byType[waste.type] = (stats.byType[waste.type] || 0) + waste.weight;
      if (waste.volunteerId) {
        stats.byVolunteer[waste.volunteerId] = (stats.byVolunteer[waste.volunteerId] || 0) + waste.weight;
      }
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching waste statistics' });
  }
});

module.exports = router;
