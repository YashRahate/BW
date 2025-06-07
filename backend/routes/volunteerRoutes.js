const express = require('express');
const jwt = require('jsonwebtoken');
const { Volunteer, Event } = require('../models');
const router = express.Router();

// Register volunteer for event
router.post('/register/:eventId', async (req, res) => {
  try {
    const { name, email, mobileNo, address, age, gender } = req.body;
    const eventId = req.params.eventId;

    // Check if event exists and is open for registration
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (new Date() > new Date(event.deadlineForRegistration)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Find or create volunteer
    let volunteer = await Volunteer.findOne({ email });
    if (!volunteer) {
      volunteer = new Volunteer({
        name,
        email,
        mobileNo,
        address,
        age,
        gender,
        password: 'temp123' // Temporary password, should be handled properly
      });
      await volunteer.save();
    }

    // Check if already registered
    if (event.registeredVolunteers.includes(volunteer._id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
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
      message: 'Successfully registered for the event',
      data: { volunteerId: volunteer._id, eventId }
    });
  } catch (error) {
    console.error('Volunteer registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Get all volunteers
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .select('-password')
      .populate('participationHistory', 'name dateOfEvent')
      .sort({ registrationDate: -1 });
    
    res.json({ success: true, data: volunteers });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching volunteers' });
  }
});

module.exports = router;