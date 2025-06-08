// backend/routes/volunteerAuthRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { Volunteer } = require('../models');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register Volunteer
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobileNo, password, address, age, gender } = req.body;

    // Check if volunteer already exists
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return res.status(400).json({ message: 'Volunteer already exists with this email' });
    }

    // Create volunteer
    const volunteer = new Volunteer({
      name,
      email,
      mobileNo,
      password,
      address,
      age,
      gender
    });

    await volunteer.save();

    // Generate token
    const token = generateToken(volunteer._id);

    res.status(201).json({
      success: true,
      message: 'Volunteer registered successfully',
      data: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Volunteer
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find volunteer
    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await volunteer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(volunteer._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get volunteer profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const volunteer = await Volunteer.findById(decoded.id).select('-password');

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;