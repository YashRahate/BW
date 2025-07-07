const express = require('express');
const jwt = require('jsonwebtoken');
const { Volunteer, Event } = require('../models');
const router = express.Router();

// Authentication middleware
const authenticateVolunteer = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const volunteer = await Volunteer.findById(decoded.id);
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    req.volunteer = volunteer;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Register volunteer for event
router.post('/register/:eventId', authenticateVolunteer, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const volunteer = req.volunteer;
    
    // Check if event exists and is open for registration
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if registration deadline has passed
    if (new Date() > new Date(event.deadlineForRegistration)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if event is upcoming
    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'This event is not open for registration' });
    }

    // Check if already registered
    if (event.registeredVolunteers.includes(volunteer._id)) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already registered for this event' 
      });
    }

    // Register volunteer for event
    event.registeredVolunteers.push(volunteer._id);
    event.volunteerRegisterCount += 1;
    await event.save();

    // Update volunteer's participation history
    volunteer.participationHistory.push(eventId);
    await volunteer.save();

    res.json({
      success: true,
      message: 'Successfully registered for the event!',
      data: { 
        volunteerId: volunteer._id, 
        eventId,
        volunteerName: volunteer.name,
        eventName: event.name
      }
    });
  } catch (error) {
    console.error('Volunteer registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

// Check if volunteer is registered for an event
router.get('/check-registration/:eventId', authenticateVolunteer, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const volunteer = req.volunteer;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isRegistered = event.registeredVolunteers.includes(volunteer._id);
    
    res.json({
      success: true,
      data: {
        isRegistered,
        canRegister: !isRegistered && 
                    new Date() <= new Date(event.deadlineForRegistration) && 
                    event.status === 'upcoming'
      }
    });
  } catch (error) {
    console.error('Check registration error:', error);
    res.status(500).json({ message: 'Server error while checking registration' });
  }
});

// Unregister volunteer from event
router.delete('/unregister/:eventId', authenticateVolunteer, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const volunteer = req.volunteer;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if volunteer is registered
    if (!event.registeredVolunteers.includes(volunteer._id)) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    // Check if it's not too late to unregister (e.g., 24 hours before event)
    const eventDate = new Date(event.dateOfEvent);
    const now = new Date();
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilEvent < 24) {
      return res.status(400).json({ 
        message: 'Cannot unregister less than 24 hours before the event' 
      });
    }

    // Remove volunteer from event
    event.registeredVolunteers = event.registeredVolunteers.filter(
      id => !id.equals(volunteer._id)
    );
    event.volunteerRegisterCount -= 1;
    await event.save();

    // Remove event from volunteer's participation history
    volunteer.participationHistory = volunteer.participationHistory.filter(
      id => !id.equals(eventId)
    );
    await volunteer.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from the event'
    });
  } catch (error) {
    console.error('Volunteer unregistration error:', error);
    res.status(500).json({ message: 'Server error during unregistration' });
  }
});

// Get all volunteers
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('participationHistory', 'name dateOfEvent')
      .sort({ registrationDate: -1 });
    
    res.json({ success: true, data: volunteers });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching volunteers' });
  }
});

module.exports = router;