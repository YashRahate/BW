const express = require('express');
const jwt = require('jsonwebtoken');
const { Organizer } = require('../models');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register Organizer
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobileNo, password, affiliatedNgo, age, gender } = req.body;

    // Check if organizer already exists
    const existingOrganizer = await Organizer.findOne({ email });
    if (existingOrganizer) {
      return res.status(400).json({ message: 'Organizer already exists with this email' });
    }

    // Create organizer
    const organizer = new Organizer({
      name,
      email,
      mobileNo,
      password,
      affiliatedNgo,
      age,
      gender
    });

    await organizer.save();

    // Generate token
    const token = generateToken(organizer._id);

    res.status(201).json({
      success: true,
      message: 'Organizer registered successfully',
      data: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        role: organizer.role,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Organizer
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find organizer
    const organizer = await Organizer.findOne({ email });
    if (!organizer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await organizer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(organizer._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        role: organizer.role,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get organizer profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const organizer = await Organizer.findById(decoded.id).select('-password');

    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    res.json({
      success: true,
      data: organizer
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;