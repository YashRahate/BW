// routes/reportRoutes.js
const express = require('express');
const { InferenceClient } = require("@huggingface/inference");
const { Event, Impact, WasteCollected, Volunteer } = require('../models');
const jwt = require('jsonwebtoken'); 

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

const router = express.Router();
const client = new InferenceClient(process.env.HF_TOKEN);

// Generate Impact Report
router.post('/generate/:eventId', verifyToken, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Fetch comprehensive event data
    const event = await Event.findById(eventId)
      .populate('registeredVolunteers', 'name email mobileNo')
      .populate('organizerId', 'name email affiliatedNgo');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if organizer owns this event
    if (event.organizerId._id.toString() !== req.organizerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch impact data
    const impact = await Impact.findOne({ eventId });
    
    // Fetch waste collection data
    const wasteData = await WasteCollected.find({ eventId })
      .populate('volunteerId', 'name');

    // Calculate statistics
    const stats = calculateEventStatistics(event, impact, wasteData);

    // Generate AI report using Hugging Face
    const reportContent = await generateAIReport(event, stats, impact, wasteData);

    res.json({
      success: true,
      data: {
        event: {
          name: event.name,
          date: event.dateOfEvent,
          location: event.beachName,
          organizer: event.organizerId.name
        },
        statistics: stats,
        reportContent,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate report' 
    });
  }
});

// Helper function to calculate statistics
function calculateEventStatistics(event, impact, wasteData) {
  const stats = {
    totalParticipants: event.registeredVolunteers ? event.registeredVolunteers.length : 0,
    totalWasteCollected: 0,
    wasteByType: {},
    co2Offset: 0,
    beachAreaCleaned: 0,
    marineLifeImpact: 0
  };

  if (impact) {
    stats.totalWasteCollected = impact.totalWasteCollected || 0;
    stats.co2Offset = impact.co2OffsetEstimation || 0;
    stats.wasteByType = impact.wasteByType || [];
  }

  // Calculate additional metrics from waste data
  wasteData.forEach(waste => {
    if (!stats.wasteByType[waste.type]) {
      stats.wasteByType[waste.type] = 0;
    }
    stats.wasteByType[waste.type] += waste.weight;
  });

  // Estimate beach area cleaned (rough calculation: 1kg waste = 100m²)
  stats.beachAreaCleaned = Math.round(stats.totalWasteCollected * 100);

  // Estimate marine life impact (pieces of plastic prevented from ocean)
  const plasticWeight = stats.wasteByType['Plastic'] || 0;
  stats.marineLifeImpact = Math.round(plasticWeight * 50); // 1kg plastic ≈ 50 pieces

  return stats;
}

// Generate AI report content
async function generateAIReport(event, stats, impact, wasteData) {
  const eventDate = new Date(event.dateOfEvent).toLocaleDateString();
  const wasteTypes = Object.keys(stats.wasteByType).join(', ');
  
  const prompt = `Generate a comprehensive Beach Cleanup Impact Report for the following event. Make it professional, scientifically accurate, and environmentally focused:

Event Details:
- Event Name: ${event.name}
- Date: ${eventDate}
- Location: ${event.beachName}
- Organizer: ${event.organizerId.name}
- Description: ${event.description}

Statistics:
- Total Participants: ${stats.totalParticipants}
- Total Waste Collected: ${stats.totalWasteCollected} kg
- Waste Types: ${wasteTypes}
- Estimated CO2 Offset: ${stats.co2Offset} kg
- Beach Area Cleaned: ${stats.beachAreaCleaned} m²
- Plastic Pieces Prevented from Ocean: ${stats.marineLifeImpact}

Please structure the report with:
1. Executive Summary
2. Event Overview
3. Environmental Impact Analysis
4. Waste Collection Results
5. Community Engagement
6. Recommendations for Future Events
7. Conclusion

Make it inspiring and highlight the positive environmental impact while maintaining scientific credibility. Keep each section concise but informative.`;

  try {
    const response = await client.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages: [
        {
          role: "system",
          content: "You are an environmental impact analyst specializing in beach cleanup reports. Generate professional, scientifically accurate reports that highlight environmental benefits and community impact."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI report generation error:', error);
    return generateFallbackReport(event, stats);
  }
}

// Fallback report if AI fails
function generateFallbackReport(event, stats) {
  return `
# Beach Cleanup Impact Report

## Executive Summary
The ${event.name} beach cleanup event successfully engaged ${stats.totalParticipants} volunteers in environmental conservation efforts at ${event.beachName}.

## Key Achievements
- **Total Waste Removed**: ${stats.totalWasteCollected} kg
- **Beach Area Cleaned**: ${stats.beachAreaCleaned} m²
- **CO2 Offset**: ${stats.co2Offset} kg equivalent
- **Marine Life Protected**: ${stats.marineLifeImpact} plastic pieces prevented from entering ocean

## Environmental Impact
This cleanup event contributed significantly to marine ecosystem protection and coastal conservation. The removal of ${stats.totalWasteCollected} kg of waste prevents harmful materials from entering the marine food chain.

## Community Engagement
With ${stats.totalParticipants} active participants, this event demonstrates strong community commitment to environmental stewardship and ocean conservation.

## Recommendations
Continue organizing regular cleanup events to maintain coastal health and expand community environmental awareness programs.
  `;
}

module.exports = router;