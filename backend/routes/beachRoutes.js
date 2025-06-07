const express = require('express');
const { Beach } = require('../models');
const router = express.Router();

// Get all beaches
router.get('/', async (req, res) => {
  try {
    const beaches = await Beach.find().sort({ beachName: 1 });
    res.json({ success: true, data: beaches });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching beaches' });
  }
});

// Get beach by name
router.get('/:name', async (req, res) => {
  try {
    const beach = await Beach.findOne({ beachName: req.params.name });
    if (!beach) {
      return res.status(404).json({ message: 'Beach not found' });
    }
    res.json({ success: true, data: beach });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching beach' });
  }
});

module.exports = router;