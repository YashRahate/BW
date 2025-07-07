const express = require('express');
const jwt = require('jsonwebtoken');
const { Event, Beach, Organizer,Volunteer } = require('../models');
const { sendNewEventNotification } = require('../services/emailService'); // Import your email service
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

// Create Event
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      name,
      dateOfEvent,
      deadlineForRegistration,
      startTime,
      endTime,
      beachName,
      beachLocation,
      beachAddress,
      description,
      image,
      refreshments,
      certificateOfParticipation,
      safetyProtocols
    } = req.body;

    // Create or find beach
    let beach = await Beach.findOne({ beachName });
    if (!beach) {
      beach = new Beach({
        beachName,
        beachLocation,
        beachAddress
      });
      await beach.save();
    }

    // Create event
    const event = new Event({
      name,
      dateOfEvent,
      deadlineForRegistration,
      startTime,
      endTime,
      beachName,
      beachLocation,
      beachAddress,
      description,
      image,
      organizerId: req.organizerId,
      refreshments,
      certificateOfParticipation,
      safetyProtocols: safetyProtocols || []
    });

    await event.save();

    // Update organizer's event history
    await Organizer.findByIdAndUpdate(req.organizerId, {
      $push: { eventHistory: event._id }
    });

    // After event is saved, send notification to all active volunteers
        const allVolunteers = await Volunteer.find({}).select('email'); // Get all volunteer emails

        const eventLink = `http://yourfrontend.com/volunteer_view_event/${event._id}`; // Replace with your actual frontend event detail page URL

        // Send emails in parallel (but be mindful of sending limits for free tiers)
        await Promise.all(allVolunteers.map(async (volunteer) => {
            if (volunteer.email) {
                await sendNewEventNotification(volunteer.email, event, eventLink);
            }
        }));

    res.status(201).json({ message: 'Event created successfully and notifications sent.', event: event });

    res.status(201).json({
      success: true,
      message: 'Event created successfully and notifications sent.', 
      event: event,
      data: event
    });
  } catch (error) {
    console.error('Error creating event and sending notifications:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// Get all events for organizer
router.get('/my-events', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.organizerId })
      .populate('registeredVolunteers', 'name email')
      .sort({ dateOfEvent: -1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registeredVolunteers', 'name email mobileNo')
      .populate('organizerId', 'name email affiliatedNgo');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // // Check if organizer owns this event
    // if (event.organizerId._id.toString() !== req.organizerId) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Fetch event error:', error);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
});

// Update event
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if organizer owns this event
    if (event.organizerId.toString() !== req.organizerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error while updating event' });
  }
});

// Delete event
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if organizer owns this event
    if (event.organizerId.toString() !== req.organizerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Remove from organizer's event history
    await Organizer.findByIdAndUpdate(req.organizerId, {
      $pull: { eventHistory: req.params.id }
    });

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
});

// Get all events (for volunteers to see)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ status: { $in: ['upcoming', 'ongoing'] } })
      .populate('organizerId', 'name affiliatedNgo')
      .sort({ dateOfEvent: 1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Fetch all events error:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

module.exports = router;